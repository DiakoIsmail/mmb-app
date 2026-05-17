<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth, signOut } from '../../composables/useAuth'
import { useOrderSettings, toggleAcceptingOrders, toggleCategory } from '../../composables/useOrderSettings'
import { supabase } from '../../lib/supabase'

const router = useRouter()
const route = useRoute()
const { user } = useAuth()
const { acceptingOrders, bakeselEnabled, tartaEnabled, magiEnabled } = useOrderSettings()
const togglingCategory = ref<string | null>(null)

async function handleToggleCategory(key: 'bakelse_enabled' | 'tarta_enabled' | 'magi_enabled') {
  togglingCategory.value = key
  const current = key === 'bakelse_enabled' ? bakeselEnabled.value : key === 'tarta_enabled' ? tartaEnabled.value : magiEnabled.value
  await toggleCategory(key, !current)
  togglingCategory.value = null
}

const pendingCount = ref<number | null>(null)
const completedToday = ref<number | null>(null)
const totalOrders = ref<number | null>(null)
const togglingOrders = ref(false)

onMounted(async () => {
  const { data } = await supabase
    .from('orders')
    .select('status, created_at')

  if (data) {
    totalOrders.value = data.length
    pendingCount.value = data.filter(o => o.status === 'pending').length
    const today = new Date().toISOString().split('T')[0]
    completedToday.value = data.filter(
      o => o.status === 'completed' && o.created_at.startsWith(today)
    ).length
  }
})

async function handleToggleOrders() {
  togglingOrders.value = true
  await toggleAcceptingOrders(!acceptingOrders.value)
  togglingOrders.value = false
}

async function handleSignOut() {
  await signOut()
  router.push('/admin/login')
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
        <RouterLink
          to="/admin/dashboard"
          class="sidebar-link"
          :class="{ 'sidebar-link--active': route.path === '/admin/dashboard' }"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
          Översikt
        </RouterLink>
        <RouterLink
          to="/admin/products"
          class="sidebar-link"
          :class="{ 'sidebar-link--active': route.path === '/admin/products' }"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Produkter
        </RouterLink>
        <RouterLink
          to="/admin/orders"
          class="sidebar-link"
          :class="{ 'sidebar-link--active': route.path === '/admin/orders' }"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="2"/>
          </svg>
          Beställningar
          <span v-if="pendingCount" class="sidebar-badge">{{ pendingCount }}</span>
        </RouterLink>
      </nav>

      <button class="sidebar-signout" @click="handleSignOut">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Logga ut
      </button>
    </aside>

    <main class="admin-main">
      <header class="admin-topbar">
        <h1 class="admin-heading">Översikt</h1>
        <div class="admin-user">
          <div class="admin-avatar">{{ user?.email?.charAt(0).toUpperCase() }}</div>
          <span class="admin-email">{{ user?.email }}</span>
        </div>
      </header>

      <div class="admin-content">
        <div class="stats-grid">
          <div class="stat-card">
            <p class="stat-label">Väntande beställningar</p>
            <p class="stat-value">{{ pendingCount ?? '…' }}</p>
            <RouterLink to="/admin/orders" class="stat-sub stat-link">Visa alla →</RouterLink>
          </div>
          <div class="stat-card">
            <p class="stat-label">Klara idag</p>
            <p class="stat-value">{{ completedToday ?? '…' }}</p>
            <p class="stat-sub">Avklarade beställningar</p>
          </div>
          <div class="stat-card">
            <p class="stat-label">Totalt beställningar</p>
            <p class="stat-value">{{ totalOrders ?? '…' }}</p>
            <p class="stat-sub">Sedan start</p>
          </div>
        </div>

        <!-- Order toggle -->
        <div class="order-toggle-card" :class="acceptingOrders ? 'order-toggle-card--open' : 'order-toggle-card--paused'">
          <div class="order-toggle-card__left">
            <div class="order-toggle-icon">
              <svg v-if="acceptingOrders" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="2"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
              <svg v-else width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
              </svg>
            </div>
            <div>
              <p class="order-toggle-card__title">
                {{ acceptingOrders ? 'Tar emot beställningar' : 'Beställningar pausade' }}
              </p>
              <p class="order-toggle-card__desc">
                {{ acceptingOrders
                  ? 'Kunder kan just nu skicka beställningar via hemsidan.'
                  : 'Kunder kan inte skicka beställningar — ett meddelande visas på hemsidan.' }}
              </p>
            </div>
          </div>
          <button
            class="order-toggle-btn"
            :class="acceptingOrders ? 'order-toggle-btn--stop' : 'order-toggle-btn--start'"
            :disabled="togglingOrders"
            @click="handleToggleOrders"
          >
            <svg v-if="acceptingOrders" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
            <svg v-else width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            {{ togglingOrders ? '…' : (acceptingOrders ? 'Pausa beställningar' : 'Starta beställningar') }}
          </button>
        </div>

        <!-- Category toggles -->
        <div class="category-toggles">
          <h3 class="category-toggles__title">Aktiva kategorier</h3>
          <div class="category-toggles__grid">
            <div
              class="category-card"
              :class="bakeselEnabled ? 'category-card--on' : 'category-card--off'"
            >
              <div class="category-card__info">
                <span class="category-card__name">Bakelse</span>
                <span class="category-card__status">{{ bakeselEnabled ? 'Synlig' : 'Dold' }}</span>
              </div>
              <button
                class="category-card__btn"
                :class="bakeselEnabled ? 'category-card__btn--off' : 'category-card__btn--on'"
                :disabled="togglingCategory === 'bakelse_enabled'"
                @click="handleToggleCategory('bakelse_enabled')"
              >
                {{ togglingCategory === 'bakelse_enabled' ? '…' : (bakeselEnabled ? 'Dölj' : 'Visa') }}
              </button>
            </div>

            <div
              class="category-card"
              :class="tartaEnabled ? 'category-card--on' : 'category-card--off'"
            >
              <div class="category-card__info">
                <span class="category-card__name">Tårta</span>
                <span class="category-card__status">{{ tartaEnabled ? 'Synlig' : 'Dold' }}</span>
              </div>
              <button
                class="category-card__btn"
                :class="tartaEnabled ? 'category-card__btn--off' : 'category-card__btn--on'"
                :disabled="togglingCategory === 'tarta_enabled'"
                @click="handleToggleCategory('tarta_enabled')"
              >
                {{ togglingCategory === 'tarta_enabled' ? '…' : (tartaEnabled ? 'Dölj' : 'Visa') }}
              </button>
            </div>

            <div
              class="category-card"
              :class="magiEnabled ? 'category-card--on' : 'category-card--off'"
            >
              <div class="category-card__info">
                <span class="category-card__name">Magi</span>
                <span class="category-card__status">{{ magiEnabled ? 'Synlig' : 'Dold' }}</span>
              </div>
              <button
                class="category-card__btn"
                :class="magiEnabled ? 'category-card__btn--off' : 'category-card__btn--on'"
                :disabled="togglingCategory === 'magi_enabled'"
                @click="handleToggleCategory('magi_enabled')"
              >
                {{ togglingCategory === 'magi_enabled' ? '…' : (magiEnabled ? 'Dölj' : 'Visa') }}
              </button>
            </div>
          </div>
        </div>

        <div class="admin-welcome">
          <h2>Välkommen tillbaka!</h2>
          <p>Du är inloggad som admin. Här kan du hantera beställningar, redigera sidans innehåll och se kundstatistik.</p>
          <RouterLink to="/" class="admin-visit-btn">Besök butikssidan →</RouterLink>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
}

.admin-sidebar {
  width: 240px;
  background: var(--dark);
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  flex-shrink: 0;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.sidebar-logo {
  height: 36px;
  width: auto;
  filter: brightness(0) invert(1);
  opacity: 0.9;
}

.sidebar-title {
  color: var(--white);
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.05em;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 20px 12px;
  flex: 1;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  color: rgba(255,255,255,0.6);
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
}

.sidebar-link:hover { background: rgba(233,30,140,0.15); color: var(--white); }
.sidebar-link--active { background: rgba(233,30,140,0.15); color: var(--pink-light); }

.sidebar-signout {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: none;
  color: rgba(255,255,255,0.4);
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
  border: none;
  width: calc(100% - 24px);
  text-align: left;
}

.sidebar-signout:hover { background: rgba(220,38,38,0.15); color: #fca5a5; }

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.admin-topbar {
  background: var(--white);
  padding: 20px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.admin-heading {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--dark);
}

.admin-user { display: flex; align-items: center; gap: 10px; }

.admin-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--pink);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
}

.admin-email { font-size: 0.875rem; color: var(--gray); }

.admin-content {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  background: var(--white);
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.stat-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gray);
  margin-bottom: 8px;
}

.stat-value { font-size: 2rem; font-weight: 700; color: var(--dark); margin-bottom: 4px; }
.stat-sub { font-size: 0.8rem; color: var(--gray); }
.stat-link { color: var(--pink); font-weight: 600; transition: opacity 0.2s; }
.stat-link:hover { opacity: 0.7; }
.sidebar-badge { margin-left: auto; background: var(--pink); color: white; font-size: 0.7rem; font-weight: 700; padding: 2px 7px; border-radius: 100px; }

.admin-welcome {
  background: var(--white);
  border-radius: 14px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border-left: 4px solid var(--pink);
}

.admin-welcome h2 {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--dark);
  margin-bottom: 10px;
}

.admin-welcome p {
  color: var(--gray);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 20px;
}

.admin-visit-btn {
  display: inline-block;
  padding: 10px 20px;
  background: var(--pink);
  color: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.admin-visit-btn:hover { background: #c9186e; }

/* --- Order toggle card --- */
.order-toggle-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  padding: 20px 24px;
  border-radius: 14px;
  border: 2px solid;
  transition: background 0.3s, border-color 0.3s;
}
.order-toggle-card--open { background: #f0fdf4; border-color: #86efac; }
.order-toggle-card--paused { background: #fff7ed; border-color: #fdba74; }

.order-toggle-card__left { display: flex; align-items: center; gap: 16px; }

.order-toggle-icon {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.order-toggle-card--open .order-toggle-icon { background: #dcfce7; color: #16a34a; }
.order-toggle-card--paused .order-toggle-icon { background: #fed7aa; color: #c2410c; }

.order-toggle-card__title { font-weight: 700; font-size: 0.95rem; color: var(--dark); margin-bottom: 3px; }
.order-toggle-card__desc { font-size: 0.82rem; color: var(--gray); }

.order-toggle-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 20px; border-radius: 9px;
  font-size: 0.88rem; font-weight: 700;
  transition: opacity 0.2s, transform 0.15s;
  flex-shrink: 0;
}
.order-toggle-btn:hover:not(:disabled) { transform: translateY(-1px); }
.order-toggle-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.order-toggle-btn--stop { background: #fee2e2; color: #991b1b; border: 1.5px solid #fca5a5; }
.order-toggle-btn--start { background: #dcfce7; color: #166534; border: 1.5px solid #86efac; }

/* --- Category toggles --- */
.category-toggles {
  background: var(--white);
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.category-toggles__title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gray);
  margin-bottom: 16px;
}

.category-toggles__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.category-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1.5px solid;
  transition: background 0.2s, border-color 0.2s;
}
.category-card--on  { background: #f0fdf4; border-color: #86efac; }
.category-card--off { background: #f9fafb; border-color: #e5e7eb; }

.category-card__info { display: flex; flex-direction: column; gap: 2px; }
.category-card__name { font-weight: 700; font-size: 0.9rem; color: var(--dark); }
.category-card__status { font-size: 0.75rem; color: var(--gray); }
.category-card--off .category-card__status { color: #9ca3af; }

.category-card__btn {
  padding: 6px 14px;
  border-radius: 7px;
  font-size: 0.82rem;
  font-weight: 700;
  transition: opacity 0.2s;
  flex-shrink: 0;
}
.category-card__btn:disabled { opacity: 0.5; cursor: not-allowed; }
.category-card__btn--off { background: #fee2e2; color: #991b1b; border: 1.5px solid #fca5a5; }
.category-card__btn--on  { background: #dcfce7; color: #166534; border: 1.5px solid #86efac; }

@media (max-width: 768px) {
  .admin-sidebar { display: none; }
  .stats-grid { grid-template-columns: 1fr; }
  .admin-content { padding: 20px 16px; }
  .category-toggles__grid { grid-template-columns: 1fr; }
}
</style>
