<script setup lang="ts">
import { ref, computed } from "vue";
import { useCart } from "../composables/useCart";
import { useOrderSettings } from "../composables/useOrderSettings";
import { supabase } from "../lib/supabase";

const { acceptingOrders } = useOrderSettings();

const {
  items,
  isOpen,
  isCheckoutStep,
  cartTotal,
  hasCustomItems,
  removeFromCart,
  setQty,
  clearCart,
  closeCart,
  goToCheckout,
  goBackToCart,
} = useCart();

const name = ref("");
const email = ref("");
const phone = ref("");
const pickupDate = ref("");
const message = ref("");
const submitting = ref(false);
const submitted = ref(false);
const submitError = ref("");

const minDate = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
});

const formValid = computed(
  () => name.value.trim() && email.value.trim() && phone.value.trim() && pickupDate.value
);

async function uploadImage(file: File): Promise<string | null> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage
    .from("order-images")
    .upload(path, file, { contentType: file.type });
  if (error || !data) return null;
  const { data: { publicUrl } } = supabase.storage
    .from("order-images")
    .getPublicUrl(data.path);
  return publicUrl;
}

async function submitOrder() {
  if (!formValid.value || submitting.value || !acceptingOrders.value) return;
  submitting.value = true;
  submitError.value = "";

  try {
    const processedItems = await Promise.all(
      items.map(async (item) => {
        let imageUrl = item.image_url;
        if (item.isCustom && item.inspirationImageFile) {
          const uploaded = await uploadImage(item.inspirationImageFile);
          if (uploaded) imageUrl = uploaded;
        }
        return {
          id: item.id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          isCustom: item.isCustom ?? false,
          customDetails: item.customDetails ?? null,
          image_url: imageUrl,
        };
      })
    );

    const orderPayload = {
      customer_name: name.value.trim(),
      customer_email: email.value.trim(),
      customer_phone: phone.value.trim(),
      pickup_date: pickupDate.value,
      message: message.value.trim() || null,
      items: processedItems,
      total_price: cartTotal.value,
      status: "pending",
    };

    const { error } = await supabase.from("orders").insert(orderPayload);
    if (error) throw error;

    // Notifiera admin – fire-and-forget, påverkar inte kundflödet
    supabase.functions.invoke("notify-admin-new-order", {
      body: orderPayload,
    }).catch(() => {});

    submitted.value = true;
    clearCart();
  } catch {
    submitError.value = "Något gick fel. Försök igen eller kontakta oss direkt.";
  } finally {
    submitting.value = false;
  }
}

function handleClose() {
  closeCart();
  if (submitted.value) {
    submitted.value = false;
    name.value = "";
    email.value = "";
    phone.value = "";
    pickupDate.value = "";
    message.value = "";
  }
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div v-if="isOpen" class="cart-backdrop" @click="handleClose" />
    </Transition>

    <!-- Drawer -->
    <Transition name="slide">
      <div v-if="isOpen" class="cart-drawer" role="dialog" aria-modal="true" aria-label="Varukorg">
        <!-- Header -->
        <div class="cart-header">
          <button v-if="isCheckoutStep && !submitted" class="cart-back-btn" @click="goBackToCart">
            ← Varukorg
          </button>
          <h2 class="cart-title">
            {{ submitted ? "Beställning skickad!" : isCheckoutStep ? "Dina uppgifter" : "Varukorg" }}
          </h2>
          <button class="cart-close-btn" @click="handleClose" aria-label="Stäng varukorg">✕</button>
        </div>

        <!-- Success state -->
        <div v-if="submitted" class="cart-success">
          <div class="cart-success__icon">🎉</div>
          <h3 class="cart-success__title">Tack för din förfrågan!</h3>
          <p class="cart-success__text">
            Vi har tagit emot din beställningsförfrågan och återkommer inom 24 timmar för att bekräfta.
          </p>
          <button class="cart-submit-btn" @click="handleClose">Stäng</button>
        </div>

        <!-- Orders paused -->
        <div v-else-if="isCheckoutStep && !acceptingOrders" class="cart-paused">
          <div class="cart-paused__icon">🧁</div>
          <h3 class="cart-paused__title">Ugnen är full just nu!</h3>
          <p class="cart-paused__text">
            Vi tar tillfälligt inte emot nya beställningar medan vi fokuserar på
            att slutföra nuvarande med omsorg. Vi öppnar snart igen — håll utkik!
          </p>
          <button class="cart-submit-btn" @click="handleClose">Stäng</button>
        </div>

        <!-- Checkout form -->
        <div v-else-if="isCheckoutStep" class="cart-form">
          <div class="form-field">
            <label class="form-label">Namn *</label>
            <input v-model="name" class="form-input" type="text" placeholder="Ditt namn" />
          </div>
          <div class="form-field">
            <label class="form-label">E-post *</label>
            <input v-model="email" class="form-input" type="email" placeholder="din@epost.se" />
          </div>
          <div class="form-field">
            <label class="form-label">Telefon *</label>
            <input v-model="phone" class="form-input" type="tel" placeholder="070 000 00 00" />
          </div>
          <div class="form-field">
            <label class="form-label">Önskat hämtdatum *</label>
            <input v-model="pickupDate" class="form-input" type="date" :min="minDate" />
          </div>
          <div class="form-field">
            <label class="form-label">Meddelande / önskemål</label>
            <textarea
              v-model="message"
              class="form-textarea"
              placeholder="Allergier, personliga önskemål, leveransinstruktioner..."
              rows="3"
            />
          </div>

          <div class="cart-order-summary">
            <span class="cart-summary-label">{{ hasCustomItems && cartTotal === 0 ? 'Pris vid bekräftelse' : 'Totalt' }}</span>
            <span class="cart-summary-total">{{ hasCustomItems && cartTotal === 0 ? '–' : `${cartTotal} kr` }}</span>
          </div>
          <p v-if="hasCustomItems" class="form-note" style="margin-top: -8px;">
            Anpassade beställningar prissätts av oss efter bekräftelse.
          </p>

          <p v-if="submitError" class="form-error">{{ submitError }}</p>

          <button
            class="cart-submit-btn"
            :class="{ 'cart-submit-btn--disabled': !formValid }"
            :disabled="!formValid || submitting"
            @click="submitOrder"
          >
            {{ submitting ? "Skickar..." : "Skicka beställningsförfrågan" }}
          </button>
          <p class="form-note">Ingen betalning krävs nu — vi kontaktar dig för att bekräfta.</p>
        </div>

        <!-- Cart items -->
        <div v-else class="cart-body">
          <div v-if="items.length === 0" class="cart-empty">
            <span class="cart-empty__icon">🛒</span>
            <p>Din varukorg är tom</p>
          </div>

          <ul v-else class="cart-list">
            <li v-for="item in items" :key="item.id" class="cart-item" :class="{ 'cart-item--custom': item.isCustom }">
              <!-- Custom order -->
              <template v-if="item.isCustom">
                <div class="cart-item__custom-img">
                  <img v-if="item.image_url" :src="item.image_url" :alt="item.name" class="cart-item__img" />
                  <span v-else class="cart-item__custom-emoji">🎂</span>
                </div>
                <div class="cart-item__info cart-item__info--custom">
                  <div class="cart-item__name-row">
                    <p class="cart-item__name">{{ item.name }}</p>
                    <span class="cart-item__custom-badge">Anpassad</span>
                  </div>
                  <div v-if="item.customDetails" class="cart-item__details">
                    <span v-if="item.customDetails.flavors.length" class="cart-item__detail-tag">
                      {{ item.customDetails.flavors.join(', ') }}
                    </span>
                    <span v-if="item.customDetails.occasion" class="cart-item__detail-tag">
                      {{ item.customDetails.occasion }}
                    </span>
                    <span v-if="item.customDetails.text" class="cart-item__detail-tag">
                      "{{ item.customDetails.text }}"
                    </span>
                  </div>
                  <p class="cart-item__price cart-item__price--custom">Pris vid bekräftelse</p>
                </div>
              </template>

              <!-- Regular product -->
              <template v-else>
                <img :src="item.image_url" :alt="item.name" class="cart-item__img" />
                <div class="cart-item__info">
                  <p class="cart-item__name">{{ item.name }}</p>
                  <p class="cart-item__price">{{ item.price * item.qty }} kr</p>
                </div>
              </template>

              <div class="cart-item__controls">
                <button class="qty-btn" @click="setQty(item.id, item.qty - 1)">−</button>
                <span class="qty-num">{{ item.qty }}</span>
                <button class="qty-btn" @click="setQty(item.id, item.qty + 1)">+</button>
              </div>
              <button class="cart-item__remove" @click="removeFromCart(item.id)" aria-label="Ta bort">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </li>
          </ul>
        </div>

        <!-- Footer (only on cart step with items) -->
        <div v-if="!isCheckoutStep && !submitted && items.length > 0" class="cart-footer">
          <div class="cart-total-row">
            <span>Totalt produkter</span>
            <span class="cart-total-price">{{ cartTotal }} kr</span>
          </div>
          <p v-if="hasCustomItems" class="cart-custom-note">
            + anpassade beställningar — pris sätts vid bekräftelse
          </p>
          <button class="cart-submit-btn" @click="goToCheckout">Gå till beställning →</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cart-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 400;
}

.cart-drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100dvh;
  width: 100%;
  max-width: 420px;
  background: var(--white);
  z-index: 401;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.15);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

.slide-enter-active,
.slide-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-enter-from,
.slide-leave-to { transform: translateX(100%); }

/* Header */
.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0e0ea;
  flex-shrink: 0;
}

.cart-title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--dark);
  flex: 1;
  text-align: center;
}

.cart-back-btn {
  background: none;
  color: var(--pink);
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
}

.cart-close-btn {
  background: none;
  font-size: 1rem;
  color: var(--gray);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}
.cart-close-btn:hover {
  background: #f9f0f5;
  color: var(--dark);
}

/* Body */
.cart-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.cart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--gray);
  font-size: 0.95rem;
}
.cart-empty__icon { font-size: 2.5rem; }

.cart-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-item__img {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.cart-item__info {
  flex: 1;
  min-width: 0;
}

.cart-item__name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item__price {
  font-size: 0.85rem;
  color: var(--pink);
  font-weight: 700;
  margin-top: 2px;
}

.cart-item__controls {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f9f0f5;
  border-radius: 20px;
  padding: 3px 8px;
  flex-shrink: 0;
}

.qty-btn {
  background: none;
  border: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 1rem;
  color: var(--dark);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}
.qty-btn:hover {
  background: var(--pink);
  color: var(--white);
}

.qty-num {
  font-size: 0.85rem;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
}

.cart-item--custom {
  align-items: flex-start;
  padding: 8px 0;
  border-bottom: 1px solid #f9f0f5;
}
.cart-item--custom:last-child {
  border-bottom: none;
}

.cart-item__custom-img {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  background: var(--pink-bg);
  border: 1px solid var(--pink-light);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.cart-item__custom-emoji {
  font-size: 1.6rem;
}

.cart-item__info--custom {
  gap: 4px;
}

.cart-item__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cart-item__custom-badge {
  font-size: 0.68rem;
  font-weight: 700;
  background: var(--pink-bg);
  color: var(--pink);
  border: 1px solid var(--pink-light);
  border-radius: 100px;
  padding: 2px 8px;
  white-space: nowrap;
}

.cart-item__details {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}

.cart-item__detail-tag {
  font-size: 0.72rem;
  color: var(--gray);
  background: #f5f5f5;
  border-radius: 6px;
  padding: 2px 7px;
}

.cart-item__price--custom {
  color: var(--gray) !important;
  font-weight: 500 !important;
  font-style: italic;
  font-size: 0.78rem !important;
}

.cart-custom-note {
  font-size: 0.78rem;
  color: var(--gray);
  font-style: italic;
  text-align: center;
  margin-top: -4px;
}

.cart-item__remove {
  background: none;
  color: #bdbdbd;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s, color 0.2s;
}
.cart-item__remove:hover {
  background: #ffe0ef;
  color: var(--pink);
}

/* Footer */
.cart-footer {
  padding: 20px 24px 28px;
  border-top: 1px solid #f0e0ea;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
}

.cart-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--dark);
}

.cart-total-price {
  font-size: 1.1rem;
  color: var(--pink);
  font-weight: 700;
}

/* Checkout form */
.cart-form {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray);
}

.form-input {
  padding: 12px 16px;
  border: 2px solid var(--pink-light);
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: var(--font-body);
  color: var(--dark);
  outline: none;
  transition: border-color 0.2s;
  background: var(--white);
}
.form-input:focus {
  border-color: var(--pink);
}
.form-input::placeholder {
  color: #bdbdbd;
}

.form-textarea {
  padding: 12px 16px;
  border: 2px solid var(--pink-light);
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: var(--font-body);
  color: var(--dark);
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
  background: var(--white);
}
.form-textarea:focus {
  border-color: var(--pink);
}
.form-textarea::placeholder {
  color: #bdbdbd;
}

.cart-order-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid #f0e0ea;
  border-bottom: 1px solid #f0e0ea;
}

.cart-summary-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--dark);
}

.cart-summary-total {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--pink);
}

.form-error {
  font-size: 0.85rem;
  color: #dc2626;
  background: #fef2f2;
  border-radius: 8px;
  padding: 10px 14px;
}

.form-note {
  font-size: 0.78rem;
  color: var(--gray);
  text-align: center;
  font-style: italic;
}

/* Submit button */
.cart-submit-btn {
  background: var(--pink);
  color: var(--white);
  font-size: 0.95rem;
  font-weight: 700;
  padding: 15px 24px;
  border-radius: 100px;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 20px rgba(233, 30, 140, 0.3);
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  text-align: center;
}
.cart-submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(233, 30, 140, 0.4);
}
.cart-submit-btn--disabled,
.cart-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

/* Success */
.cart-success {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 40px 32px;
  text-align: center;
}

.cart-success__icon { font-size: 3rem; }

.cart-success__title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--dark);
}

.cart-success__text {
  color: var(--gray);
  font-size: 0.95rem;
  line-height: 1.6;
}

.cart-paused {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 40px 32px;
  text-align: center;
}

.cart-paused__icon { font-size: 3rem; }

.cart-paused__title {
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--dark);
}

.cart-paused__text {
  color: var(--gray);
  font-size: 0.92rem;
  line-height: 1.65;
  max-width: 280px;
}

@media (max-width: 480px) {
  .cart-drawer {
    max-width: 100%;
  }
}
</style>
