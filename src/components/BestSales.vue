<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "../lib/supabase";
import { useCart } from "../composables/useCart";

const { addToCart } = useCart();

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  ingredients: string | null;
  allergens: string[];
  qty: number;
}

const products = ref<Product[]>([]);
const loading = ref(true);
const error = ref(false);
const selectedProduct = ref<Product | null>(null);

onMounted(async () => {
  const { data, error: err } = await supabase
    .from("products")
    .select("id, name, price, image_url, ingredients, allergens")
    .order("sort_order", { ascending: true });

  if (err) {
    error.value = true;
  } else {
    products.value = (data ?? []).map((p) => ({
      ...p,
      allergens: p.allergens ?? [],
      qty: 1,
    }));
  }
  loading.value = false;
});

function decrement(p: Product) {
  if (p.qty > 1) p.qty--;
}
function increment(p: Product) {
  p.qty++;
}
</script>

<template>
  <section class="sales">
    <h2 class="section-title">Våra bakvärk</h2>

    <div v-if="loading" class="sales__loading">
      <div class="sales__spinner" />
    </div>

    <p v-else-if="error" class="sales__error">
      Kunde inte ladda produkter. Försök igen senare.
    </p>

    <div v-else class="sales__grid">
      <div v-for="p in products" :key="p.id" class="sales__card">
        <div class="sales__img-wrap">
          <img :src="p.image_url" :alt="p.name" class="sales__img" />
          <div class="sales__overlay">
            <button
              class="sales__icon-btn"
              title="Lägg i varukorg"
              @click="addToCart({ id: p.id, name: p.name, price: p.price, image_url: p.image_url })"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </button>
            <button
              v-if="p.ingredients || p.allergens.length"
              class="sales__icon-btn"
              :aria-label="`Info om ${p.name}`"
              title="Ingredienser & allergener"
              @click="selectedProduct = p"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </button>
          </div>
        </div>
        <div class="sales__info">
          <p class="sales__name">{{ p.name }}</p>
          <div class="sales__row">
            <span class="sales__price">{{ p.price }} kr</span>
            <div class="sales__qty">
              <button class="qty-btn" @click="decrement(p)">&#8722;</button>
              <span class="qty-num">{{ p.qty }}</span>
              <button class="qty-btn" @click="increment(p)">&#43;</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product info modal -->
    <Teleport to="body">
      <div
        v-if="selectedProduct"
        class="info-overlay"
        @click.self="selectedProduct = null"
      >
        <div class="info-modal">
          <div class="info-modal__img-wrap">
            <img
              :src="selectedProduct.image_url"
              :alt="selectedProduct.name"
              class="info-modal__img"
            />
            <button class="info-modal__close" @click="selectedProduct = null">
              ✕
            </button>
          </div>

          <div class="info-modal__body">
            <div class="info-modal__top">
              <h3 class="info-modal__name">{{ selectedProduct.name }}</h3>
              <span class="info-modal__price"
                >{{ selectedProduct.price }} kr</span
              >
            </div>

            <div v-if="selectedProduct.ingredients" class="info-modal__section">
              <h4 class="info-modal__label">Ingredienser</h4>
              <p class="info-modal__text">{{ selectedProduct.ingredients }}</p>
            </div>

            <div
              v-if="selectedProduct.allergens.length"
              class="info-modal__section"
            >
              <h4 class="info-modal__label">Allergener</h4>
              <div class="info-modal__allergens">
                <span
                  v-for="a in selectedProduct.allergens"
                  :key="a"
                  class="allergen-badge"
                >
                  {{ a }}
                </span>
              </div>
              <p class="info-modal__allergen-note">
                Kan innehålla spår av andra allergener. Kontakta oss vid frågor.
              </p>
            </div>

            <div
              v-if="
                !selectedProduct.ingredients &&
                !selectedProduct.allergens.length
              "
              class="info-modal__section"
            >
              <p class="info-modal__text">Ingen information tillgänglig.</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.sales {
  background: var(--white);
}

.sales__loading {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.sales__spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--pink-light);
  border-top-color: var(--pink);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.sales__error {
  text-align: center;
  color: var(--gray);
  padding: 40px 0;
}

.sales__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  max-width: 1100px;
  margin: 0 auto;
}

.sales__card {
  background: var(--white);
  border: 1px solid #f0e0ea;
  border-radius: 16px;
  overflow: hidden;
  transition:
    box-shadow 0.3s,
    transform 0.3s;
  text-align: center;
}
.sales__card:hover {
  box-shadow: 0 8px 28px rgba(233, 30, 140, 0.14);
  transform: translateY(-4px);
}

.sales__img-wrap {
  position: relative;
  overflow: hidden;
}

.sales__img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  transition: transform 0.4s;
  display: block;
}
.sales__card:hover .sales__img {
  transform: scale(1.06);
}

.sales__overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.5));
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  opacity: 0;
  transition: opacity 0.3s;
}
.sales__card:hover .sales__overlay { opacity: 1; }

.sales__icon-btn {
  background: var(--white);
  border: none;
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--dark);
  transition: background 0.2s, color 0.2s;
}
.sales__icon-btn:hover { background: var(--pink); color: var(--white); }

.sales__info { padding: 14px 16px 10px; text-align: center; }

.sales__name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--dark);
  margin-bottom: 8px;
}

.sales__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sales__price {
  color: var(--pink);
  font-weight: 700;
  font-size: 0.9rem;
}

.sales__qty {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f9f0f5;
  border-radius: 20px;
  padding: 2px 6px;
}

.qty-btn {
  background: none;
  border: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 0.9rem;
  color: var(--dark);
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.2s,
    color 0.2s;
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

/* Info modal */
.info-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 24px;
}

.info-modal {
  background: var(--white);
  border-radius: 20px;
  width: 100%;
  max-width: 420px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  animation: modal-in 0.2s ease;
}

@keyframes modal-in {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.info-modal__img-wrap {
  position: relative;
}

.info-modal__img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

.info-modal__close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  font-size: 0.85rem;
  color: var(--dark);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.info-modal__close:hover {
  background: white;
}

.info-modal__body {
  padding: 20px 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-modal__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.info-modal__name {
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--dark);
}

.info-modal__price {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--pink);
  white-space: nowrap;
}

.info-modal__section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-modal__label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gray);
}

.info-modal__text {
  font-size: 0.9rem;
  color: var(--dark);
  line-height: 1.6;
}

.info-modal__allergens {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.allergen-badge {
  background: #fff3e0;
  color: #92400e;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
}

.info-modal__allergen-note {
  font-size: 0.75rem;
  color: var(--gray);
  font-style: italic;
}

@media (max-width: 640px) {
  .sales__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 641px) and (max-width: 900px) {
  .sales__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
