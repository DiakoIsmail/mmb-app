<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth, signOut } from "../../composables/useAuth";
import { supabase } from "../../lib/supabase";

const router = useRouter();
const route = useRoute();
const { user } = useAuth();

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  isCustom: boolean;
  customDetails: {
    type: string;
    flavors: string[];
    text: string;
    occasion: string;
    motif: string;
  } | null;
  image_url: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_date: string;
  message: string | null;
  items: OrderItem[];
  total_price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
}

const orders = ref<Order[]>([]);
const loading = ref(true);
const error = ref("");
const filterStatus = ref<string>("all");
const expandedId = ref<string | null>(null);
const updatingId = ref<string | null>(null);
const editingPickupId = ref<string | null>(null);
const editingPickupDate = ref("");

const selectedIds = ref(new Set<string>());
const confirmDeleteIds = ref<string[]>([]);
const deleting = ref(false);

const allVisibleSelected = computed(
  () => filtered.value.length > 0 && filtered.value.every((o) => selectedIds.value.has(o.id))
);

function toggleSelect(id: string) {
  const s = new Set(selectedIds.value);
  s.has(id) ? s.delete(id) : s.add(id);
  selectedIds.value = s;
}

function toggleSelectAll() {
  if (allVisibleSelected.value) {
    selectedIds.value = new Set();
  } else {
    selectedIds.value = new Set(filtered.value.map((o) => o.id));
  }
}

function askDeleteSelected() {
  confirmDeleteIds.value = [...selectedIds.value];
}

function askDeleteOne(id: string) {
  confirmDeleteIds.value = [id];
}

function cancelDelete() {
  confirmDeleteIds.value = [];
}

async function confirmDelete() {
  if (!confirmDeleteIds.value.length) return;
  deleting.value = true;
  const ids = confirmDeleteIds.value;

  const ordersToDelete = orders.value.filter((o) => ids.includes(o.id));
  const imagePaths: string[] = [];
  for (const order of ordersToDelete) {
    for (const item of order.items) {
      if (item.image_url) {
        try {
          const parts = new URL(item.image_url).pathname.split("/order-images/");
          if (parts.length > 1) imagePaths.push(decodeURIComponent(parts[1]));
        } catch { /* invalid URL, skip */ }
      }
    }
  }
  if (imagePaths.length) {
    await supabase.storage.from("order-images").remove(imagePaths);
  }

  const { error: err } = await supabase.from("orders").delete().in("id", ids);
  if (err) {
    showToast("Kunde inte radera beställningarna.", "error");
  } else {
    orders.value = orders.value.filter((o) => !ids.includes(o.id));
    const s = new Set(selectedIds.value);
    ids.forEach((id) => s.delete(id));
    selectedIds.value = s;
    if (expandedId.value && ids.includes(expandedId.value)) expandedId.value = null;
    showToast(ids.length === 1 ? "Beställningen raderades." : `${ids.length} beställningar raderades.`);
  }
  confirmDeleteIds.value = [];
  deleting.value = false;
}

interface Toast { id: number; msg: string; type: "success" | "error" }
const toasts = ref<Toast[]>([]);
let toastSeq = 0;

function showToast(msg: string, type: Toast["type"] = "success") {
  const id = ++toastSeq;
  toasts.value.push({ id, msg, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, 4000);
}

const filtered = computed(() =>
  filterStatus.value === "all"
    ? orders.value
    : orders.value.filter((o) => o.status === filterStatus.value)
);

const counts = computed(() => ({
  all: orders.value.length,
  pending: orders.value.filter((o) => o.status === "pending").length,
  confirmed: orders.value.filter((o) => o.status === "confirmed").length,
  completed: orders.value.filter((o) => o.status === "completed").length,
  cancelled: orders.value.filter((o) => o.status === "cancelled").length,
}));

const realtimeChannel = supabase
  .channel("admin-orders-realtime")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "orders" },
    (payload) => {
      const newOrder = payload.new as Order;
      orders.value.unshift(newOrder);
      showToast(`Ny beställning från ${newOrder.customer_name}!`);
    }
  )
  .subscribe();

onMounted(async () => {
  await fetchOrders();
});

onUnmounted(() => {
  supabase.removeChannel(realtimeChannel);
});

async function fetchOrders() {
  loading.value = true;
  error.value = "";
  const { data, error: err } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (err) {
    error.value = "Kunde inte hämta beställningar.";
  } else {
    orders.value = data ?? [];
  }
  loading.value = false;
}

async function setStatus(id: string, status: Order["status"]) {
  updatingId.value = id;
  const { error: err } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (err) {
    showToast("Kunde inte uppdatera status.", "error");
    updatingId.value = null;
    return;
  }

  const order = orders.value.find((o) => o.id === id);
  if (order) order.status = status;

  if (status === "confirmed") {
    const { error: fnErr } = await supabase.functions.invoke(
      "send-confirmation-email",
      { body: { order_id: id } }
    );
    if (fnErr) {
      showToast("Status uppdaterad — men email kunde inte skickas.", "error");
    } else {
      showToast(`Bekräftelse skickad till ${order?.customer_email ?? "kunden"}.`);
    }
  } else {
    const labels: Record<Order["status"], string> = {
      pending: "Inväntar",
      confirmed: "Bekräftad",
      completed: "Klar",
      cancelled: "Avbruten",
    };
    showToast(`Status ändrad till "${labels[status]}".`);
  }

  updatingId.value = null;
}

async function rejectOrder(id: string) {
  updatingId.value = id;
  const { error: err } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (err) {
    showToast("Kunde inte neka beställningen.", "error");
    updatingId.value = null;
    return;
  }

  const order = orders.value.find((o) => o.id === id);
  if (order) order.status = "cancelled";

  const { error: fnErr } = await supabase.functions.invoke(
    "send-rejection-email",
    { body: { order_id: id } }
  );
  if (fnErr) {
    showToast("Beställning nekad — men email kunde inte skickas.", "error");
  } else {
    showToast(`Nekningsmail skickat till ${order?.customer_email ?? "kunden"}.`);
  }

  updatingId.value = null;
}

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id;
  editingPickupId.value = null;
}

function startEditPickup(order: Order) {
  editingPickupId.value = order.id;
  editingPickupDate.value = order.pickup_date;
}

function cancelEditPickup() {
  editingPickupId.value = null;
  editingPickupDate.value = "";
}

async function savePickupDate(order: Order) {
  if (!editingPickupDate.value || editingPickupDate.value === order.pickup_date) {
    cancelEditPickup();
    return;
  }
  updatingId.value = order.id;
  const { error: err } = await supabase
    .from("orders")
    .update({ pickup_date: editingPickupDate.value })
    .eq("id", order.id);

  if (err) {
    showToast("Kunde inte uppdatera datum.", "error");
  } else {
    order.pickup_date = editingPickupDate.value;
    showToast("Leveransdatum uppdaterat.");
    cancelEditPickup();
  }
  updatingId.value = null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPickup(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const statusLabel: Record<Order["status"], string> = {
  pending: "Inväntar",
  confirmed: "Bekräftad",
  completed: "Klar",
  cancelled: "Avbruten",
};

const statusClass: Record<Order["status"], string> = {
  pending: "badge--pending",
  confirmed: "badge--confirmed",
  completed: "badge--completed",
  cancelled: "badge--cancelled",
};

async function handleSignOut() {
  await signOut();
  router.push("/admin/login");
}
</script>

<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <img src="../../assets/logos/mandys-logo_.png" alt="Mandy's Magic Bakery" class="sidebar-logo" />
        <span class="sidebar-title">Admin</span>
      </div>
      <nav class="sidebar-nav">
        <RouterLink to="/admin/dashboard" class="sidebar-link" :class="{ 'sidebar-link--active': route.path === '/admin/dashboard' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
          Översikt
        </RouterLink>
        <RouterLink to="/admin/products" class="sidebar-link" :class="{ 'sidebar-link--active': route.path === '/admin/products' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Produkter
        </RouterLink>
        <RouterLink to="/admin/orders" class="sidebar-link" :class="{ 'sidebar-link--active': route.path === '/admin/orders' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="2"/>
          </svg>
          Beställningar
          <span v-if="counts.pending > 0" class="sidebar-badge">{{ counts.pending }}</span>
        </RouterLink>
      </nav>
      <button class="sidebar-signout" @click="handleSignOut">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Logga ut
      </button>
    </aside>

    <main class="admin-main">
      <header class="admin-topbar">
        <h1 class="admin-heading">Beställningar</h1>
        <div class="admin-user">
          <div class="admin-avatar">{{ user?.email?.charAt(0).toUpperCase() }}</div>
          <span class="admin-email">{{ user?.email }}</span>
        </div>
      </header>

      <div class="admin-content">
        <!-- Filter tabs -->
        <div class="filter-tabs">
          <button
            v-for="tab in ['all','pending','confirmed','completed','cancelled']"
            :key="tab"
            class="filter-tab"
            :class="{ 'filter-tab--active': filterStatus === tab }"
            @click="filterStatus = tab"
          >
            {{ tab === 'all' ? 'Alla' : statusLabel[tab as Order['status']] }}
            <span class="filter-tab__count">{{ counts[tab as keyof typeof counts] }}</span>
          </button>
        </div>

        <!-- Bulk action bar -->
        <Transition name="bulk-bar">
          <div v-if="selectedIds.size > 0" class="bulk-bar">
            <label class="bulk-checkbox-wrap" @click.prevent="toggleSelectAll">
              <input type="checkbox" :checked="allVisibleSelected" class="bulk-checkbox" readonly />
              <span>{{ allVisibleSelected ? 'Avmarkera alla' : 'Välj alla' }} ({{ selectedIds.size }} valda)</span>
            </label>
            <button class="bulk-delete-btn" @click="askDeleteSelected">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
              Radera valda ({{ selectedIds.size }})
            </button>
            <button class="bulk-cancel-btn" @click="selectedIds = new Set()">Avbryt</button>
          </div>
        </Transition>

        <div v-if="loading" class="orders-loading">
          <div class="spinner" />
        </div>

        <p v-else-if="error" class="orders-error">{{ error }}</p>

        <p v-else-if="filtered.length === 0" class="orders-empty">
          Inga beställningar här.
        </p>

        <div v-else class="orders-list">
          <div v-for="order in filtered" :key="order.id" class="order-card">
            <!-- Card header -->
            <div class="order-card__header" :class="{ 'order-card__header--selected': selectedIds.has(order.id) }">
              <label class="order-checkbox-wrap" @click.stop>
                <input
                  type="checkbox"
                  class="order-checkbox"
                  :checked="selectedIds.has(order.id)"
                  @change="toggleSelect(order.id)"
                />
              </label>
              <div class="order-card__header-body" @click="toggleExpand(order.id)">
              <div class="order-card__left">
                <span :class="['status-badge', statusClass[order.status]]">
                  {{ statusLabel[order.status] }}
                </span>
                <div class="order-card__meta">
                  <p class="order-card__name">{{ order.customer_name }}</p>
                  <p class="order-card__date">Inkommen: {{ formatDate(order.created_at) }}</p>
                </div>
              </div>
              <div class="order-card__right">
                <div class="order-card__pickup">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {{ formatPickup(order.pickup_date) }}
                </div>
                <span class="order-card__total">
                  {{ order.total_price > 0 ? `${order.total_price} kr` : 'Pris ej satt' }}
                </span>
                <svg
                  class="order-card__chevron"
                  :class="{ 'order-card__chevron--open': expandedId === order.id }"
                  width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
              </div>
            </div>

            <!-- Expanded details -->
            <div v-if="expandedId === order.id" class="order-card__body">
              <!-- Contact info -->
              <div class="order-detail-section">
                <h4 class="order-detail-label">Kontaktuppgifter</h4>
                <div class="order-detail-grid">
                  <div><span class="detail-key">E-post</span><span class="detail-val">{{ order.customer_email }}</span></div>
                  <div><span class="detail-key">Telefon</span><span class="detail-val">{{ order.customer_phone }}</span></div>
                  <div v-if="order.message"><span class="detail-key">Meddelande</span><span class="detail-val">{{ order.message }}</span></div>
                </div>
              </div>

              <!-- Pickup date editor -->
              <div class="order-detail-section">
                <h4 class="order-detail-label">Upphämtningsdatum</h4>
                <div v-if="editingPickupId !== order.id" class="pickup-display">
                  <span class="pickup-display__date">{{ formatPickup(order.pickup_date) }}</span>
                  <button class="pickup-edit-btn" @click="startEditPickup(order)">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Ändra
                  </button>
                </div>
                <div v-else class="pickup-edit-row">
                  <input
                    v-model="editingPickupDate"
                    type="date"
                    class="pickup-date-input"
                    :min="new Date().toISOString().split('T')[0]"
                  />
                  <button
                    class="action-btn action-btn--complete"
                    :disabled="updatingId === order.id"
                    @click="savePickupDate(order)"
                  >Spara</button>
                  <button
                    class="action-btn action-btn--cancel"
                    @click="cancelEditPickup"
                  >Avbryt</button>
                </div>
              </div>

              <!-- Items -->
              <div class="order-detail-section">
                <h4 class="order-detail-label">Produkter / beställningar</h4>
                <ul class="order-items-list">
                  <li v-for="(item, idx) in order.items" :key="idx" class="order-item">
                    <div class="order-item__img-wrap">
                      <img v-if="item.image_url" :src="item.image_url" :alt="item.name" class="order-item__img" />
                      <span v-else class="order-item__emoji">🎂</span>
                    </div>
                    <div class="order-item__info">
                      <div class="order-item__name-row">
                        <p class="order-item__name">{{ item.name }}</p>
                        <span v-if="item.isCustom" class="badge-custom">Anpassad</span>
                      </div>
                      <p class="order-item__qty">Antal: {{ item.qty }}</p>
                      <div v-if="item.customDetails" class="order-item__custom">
                        <span v-if="item.customDetails.flavors?.length" class="detail-chip">
                          🍰 {{ item.customDetails.flavors.join(', ') }}
                        </span>
                        <span v-if="item.customDetails.occasion" class="detail-chip">
                          {{ item.customDetails.occasion }}
                        </span>
                        <span v-if="item.customDetails.text" class="detail-chip">
                          "{{ item.customDetails.text }}"
                        </span>
                        <span v-if="item.customDetails.motif" class="detail-chip">
                          Motiv: {{ item.customDetails.motif }}
                        </span>
                      </div>
                    </div>
                    <p class="order-item__price">
                      {{ item.isCustom ? '–' : `${item.price * item.qty} kr` }}
                    </p>
                  </li>
                </ul>
              </div>

              <!-- Status actions -->
              <div class="order-actions">
                <p class="order-actions__label">Ändra status:</p>
                <div class="order-actions__btns">
                  <button
                    v-if="order.status !== 'confirmed'"
                    class="action-btn action-btn--confirm"
                    :disabled="updatingId === order.id"
                    @click="setStatus(order.id, 'confirmed')"
                  >Bekräfta</button>
                  <button
                    v-if="order.status !== 'completed'"
                    class="action-btn action-btn--complete"
                    :disabled="updatingId === order.id"
                    @click="setStatus(order.id, 'completed')"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Markera som klar
                  </button>
                  <button
                    v-if="order.status !== 'cancelled'"
                    class="action-btn action-btn--reject"
                    :disabled="updatingId === order.id"
                    @click="rejectOrder(order.id)"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Neka &amp; meddela kund
                  </button>
                  <button
                    class="action-btn action-btn--delete"
                    :disabled="updatingId === order.id"
                    @click="askDeleteOne(order.id)"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/>
                    </svg>
                    Radera
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Delete confirmation modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="confirmDeleteIds.length > 0" class="modal-overlay" @click.self="cancelDelete">
        <div class="modal">
          <div class="modal__icon">
            <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/>
            </svg>
          </div>
          <h3 class="modal__title">Radera {{ confirmDeleteIds.length === 1 ? 'beställning' : `${confirmDeleteIds.length} beställningar` }}?</h3>
          <p class="modal__body">Åtgärden kan inte ångras.</p>
          <div class="modal__actions">
            <button class="modal-btn modal-btn--cancel" :disabled="deleting" @click="cancelDelete">Avbryt</button>
            <button class="modal-btn modal-btn--delete" :disabled="deleting" @click="confirmDelete">
              {{ deleting ? 'Raderar…' : 'Ja, radera' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Toast notifications -->
  <Teleport to="body">
    <div class="toast-stack">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast"
          :class="t.type === 'error' ? 'toast--error' : 'toast--success'"
        >
          <svg v-if="t.type === 'success'" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <svg v-else width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ t.msg }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
/* --- Layout (same as other admin views) --- */
.admin-layout { display: flex; min-height: 100vh; background: #f8f9fa; }
.admin-sidebar { width: 240px; background: var(--dark); display: flex; flex-direction: column; padding: 24px 0; flex-shrink: 0; }
.sidebar-brand { display: flex; align-items: center; gap: 10px; padding: 0 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.sidebar-logo { height: 36px; width: auto; filter: brightness(0) invert(1); opacity: 0.9; }
.sidebar-title { color: var(--white); font-weight: 700; font-size: 1rem; letter-spacing: 0.05em; }
.sidebar-nav { display: flex; flex-direction: column; gap: 2px; padding: 20px 12px; flex: 1; }
.sidebar-link { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: rgba(255,255,255,0.6); font-size: 0.9rem; font-weight: 500; transition: background 0.2s, color 0.2s; }
.sidebar-link:hover { background: rgba(233,30,140,0.15); color: var(--white); }
.sidebar-link--active { background: rgba(233,30,140,0.15); color: var(--pink-light); }
.sidebar-badge { margin-left: auto; background: var(--pink); color: white; font-size: 0.7rem; font-weight: 700; padding: 2px 7px; border-radius: 100px; }
.sidebar-signout { display: flex; align-items: center; gap: 10px; margin: 0 12px; padding: 10px 12px; border-radius: 8px; background: none; color: rgba(255,255,255,0.4); font-size: 0.9rem; font-weight: 500; transition: background 0.2s, color 0.2s; border: none; width: calc(100% - 24px); text-align: left; }
.sidebar-signout:hover { background: rgba(220,38,38,0.15); color: #fca5a5; }
.admin-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.admin-topbar { background: var(--white); padding: 20px 32px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f0f0f0; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.admin-heading { font-family: var(--font-display); font-size: 1.5rem; color: var(--dark); }
.admin-user { display: flex; align-items: center; gap: 10px; }
.admin-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--pink); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.95rem; }
.admin-email { font-size: 0.875rem; color: var(--gray); }
.admin-content { padding: 28px 32px; display: flex; flex-direction: column; gap: 20px; overflow-y: auto; flex: 1; }

/* --- Filter tabs --- */
.filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
.filter-tab { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 100px; border: 2px solid #e5e7eb; background: var(--white); color: var(--gray); font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
.filter-tab:hover { border-color: var(--pink-light); color: var(--dark); }
.filter-tab--active { border-color: var(--pink); background: var(--pink); color: white; }
.filter-tab__count { background: rgba(0,0,0,0.12); border-radius: 100px; padding: 1px 7px; font-size: 0.75rem; }
.filter-tab--active .filter-tab__count { background: rgba(255,255,255,0.25); }

/* --- States --- */
.orders-loading { display: flex; justify-content: center; padding: 60px 0; }
.spinner { width: 36px; height: 36px; border: 3px solid var(--pink-light); border-top-color: var(--pink); border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.orders-error, .orders-empty { text-align: center; color: var(--gray); padding: 40px 0; }

/* --- Order cards --- */
.orders-list { display: flex; flex-direction: column; gap: 12px; }

.order-card { background: var(--white); border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #f0f0f0; }

.order-card__header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; cursor: pointer; transition: background 0.15s; gap: 12px; }
.order-card__header:hover { background: #fafafa; }

.order-card__left { display: flex; align-items: center; gap: 14px; }
.order-card__meta { display: flex; flex-direction: column; gap: 2px; }
.order-card__name { font-weight: 700; font-size: 0.95rem; color: var(--dark); }
.order-card__date { font-size: 0.78rem; color: var(--gray); }

.order-card__right { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
.order-card__pickup { display: flex; align-items: center; gap: 5px; font-size: 0.82rem; color: var(--gray); }
.order-card__total { font-size: 0.9rem; font-weight: 700; color: var(--pink); white-space: nowrap; }
.order-card__chevron { color: var(--gray); transition: transform 0.2s; flex-shrink: 0; }
.order-card__chevron--open { transform: rotate(180deg); }

/* Status badges */
.status-badge { font-size: 0.72rem; font-weight: 700; padding: 4px 10px; border-radius: 100px; white-space: nowrap; }
.badge--pending { background: #fef3c7; color: #92400e; }
.badge--confirmed { background: #dbeafe; color: #1e40af; }
.badge--completed { background: #d1fae5; color: #065f46; }
.badge--cancelled { background: #fee2e2; color: #991b1b; }

/* Expanded body */
.order-card__body { border-top: 1px solid #f0f0f0; padding: 20px; display: flex; flex-direction: column; gap: 20px; }

.order-detail-section { display: flex; flex-direction: column; gap: 10px; }
.order-detail-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gray); }
.order-detail-grid { display: flex; flex-direction: column; gap: 6px; }
.detail-key { font-size: 0.8rem; color: var(--gray); margin-right: 8px; }
.detail-val { font-size: 0.88rem; color: var(--dark); font-weight: 500; }

/* Items list */
.order-items-list { display: flex; flex-direction: column; gap: 12px; }
.order-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: #fafafa; border-radius: 10px; }
.order-item__img-wrap { width: 52px; height: 52px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: var(--pink-bg); display: flex; align-items: center; justify-content: center; }
.order-item__img { width: 100%; height: 100%; object-fit: cover; }
.order-item__emoji { font-size: 1.5rem; }
.order-item__info { flex: 1; min-width: 0; }
.order-item__name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 2px; }
.order-item__name { font-size: 0.88rem; font-weight: 600; color: var(--dark); }
.badge-custom { font-size: 0.68rem; font-weight: 700; background: var(--pink-bg); color: var(--pink); border: 1px solid var(--pink-light); border-radius: 100px; padding: 2px 8px; }
.order-item__qty { font-size: 0.78rem; color: var(--gray); }
.order-item__custom { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.detail-chip { font-size: 0.72rem; color: var(--gray); background: #ececec; border-radius: 6px; padding: 2px 8px; }
.order-item__price { font-size: 0.9rem; font-weight: 700; color: var(--pink); white-space: nowrap; flex-shrink: 0; }

/* Pickup date editor */
.pickup-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pickup-display__date {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--dark);
}

.pickup-edit-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  color: var(--pink);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--pink-light);
  transition: background 0.2s;
}
.pickup-edit-btn:hover {
  background: var(--pink-bg);
}

.pickup-edit-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pickup-date-input {
  padding: 8px 12px;
  border: 2px solid var(--pink-light);
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: var(--font-body);
  color: var(--dark);
  outline: none;
  transition: border-color 0.2s;
}
.pickup-date-input:focus {
  border-color: var(--pink);
}

/* Actions */
.order-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding-top: 4px; border-top: 1px solid #f0f0f0; }
.order-actions__label { font-size: 0.82rem; font-weight: 600; color: var(--gray); }
.order-actions__btns { display: flex; gap: 8px; flex-wrap: wrap; }
.action-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; transition: opacity 0.2s, transform 0.15s; }
.action-btn:hover:not(:disabled) { transform: translateY(-1px); }
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.action-btn--confirm { background: #dbeafe; color: #1e40af; }
.action-btn--complete { background: #d1fae5; color: #065f46; }
.action-btn--cancel { background: #fee2e2; color: #991b1b; }
.action-btn--reject { background: #fee2e2; color: #991b1b; border: 1.5px solid #fca5a5; }

/* Toast */
.toast-stack {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 18px;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  pointer-events: auto;
  max-width: 340px;
}

.toast--success { background: #065f46; color: #d1fae5; }
.toast--error   { background: #991b1b; color: #fee2e2; }

.toast-enter-active { transition: all 0.25s ease; }
.toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from   { opacity: 0; transform: translateY(12px); }
.toast-leave-to     { opacity: 0; transform: translateX(20px); }

@media (max-width: 768px) {
  .admin-sidebar { display: none; }
  .admin-content { padding: 16px; }
  .order-card__right { flex-direction: column; align-items: flex-end; gap: 4px; }
  .order-card__pickup { display: none; }
  .toast-stack { bottom: 16px; right: 16px; left: 16px; }
  .toast { max-width: 100%; }
}

/* --- Checkbox & header selection --- */
.order-card__header {
  display: flex;
  align-items: center;
  gap: 0;
  cursor: default;
  transition: background 0.15s;
}
.order-card__header:hover { background: #fafafa; }
.order-card__header--selected { background: #fff5fa; }

.order-checkbox-wrap {
  display: flex;
  align-items: center;
  padding: 16px 4px 16px 16px;
  cursor: pointer;
  flex-shrink: 0;
}
.order-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--pink);
  cursor: pointer;
}

.order-card__header-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  padding: 16px 20px 16px 10px;
  cursor: pointer;
  gap: 12px;
}

/* --- Bulk bar --- */
.bulk-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 16px;
  background: #fff5fa;
  border: 1.5px solid var(--pink-light);
  border-radius: 10px;
}

.bulk-checkbox-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--dark);
  cursor: pointer;
  user-select: none;
}
.bulk-checkbox { width: 15px; height: 15px; accent-color: var(--pink); cursor: pointer; }

.bulk-delete-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  padding: 8px 16px;
  background: #fee2e2;
  color: #991b1b;
  border: 1.5px solid #fca5a5;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  transition: background 0.2s;
}
.bulk-delete-btn:hover { background: #fecaca; }

.bulk-cancel-btn {
  padding: 8px 14px;
  background: none;
  color: var(--gray);
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: background 0.2s;
}
.bulk-cancel-btn:hover { background: #f3f4f6; }

.bulk-bar-enter-active, .bulk-bar-leave-active { transition: all 0.2s ease; }
.bulk-bar-enter-from, .bulk-bar-leave-to { opacity: 0; transform: translateY(-6px); }

/* --- Individual delete button --- */
.action-btn--delete { background: #fee2e2; color: #991b1b; border: 1.5px solid #fca5a5; }
.action-btn--delete:hover:not(:disabled) { background: #fecaca; }

/* --- Confirmation modal --- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 16px;
}

.modal {
  background: var(--white);
  border-radius: 16px;
  padding: 32px 28px;
  max-width: 380px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

.modal__icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fee2e2;
  color: #991b1b;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.modal__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--dark);
}

.modal__body {
  font-size: 0.88rem;
  color: var(--gray);
}

.modal__actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  width: 100%;
}

.modal-btn {
  flex: 1;
  padding: 11px 0;
  border-radius: 9px;
  font-size: 0.9rem;
  font-weight: 700;
  transition: opacity 0.2s;
}
.modal-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.modal-btn--cancel { background: #f3f4f6; color: var(--dark); }
.modal-btn--cancel:hover:not(:disabled) { background: #e5e7eb; }
.modal-btn--delete { background: #dc2626; color: white; }
.modal-btn--delete:hover:not(:disabled) { background: #b91c1c; }

.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal { transform: scale(0.95); }
</style>
