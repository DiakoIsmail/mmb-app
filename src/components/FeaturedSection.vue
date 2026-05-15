<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  ingredients: string | null
  allergens: string[]
}

const featured = ref<Product[]>([])
const loading = ref(true)
const selectedProduct = ref<Product | null>(null)

onMounted(async () => {
  const { data } = await supabase
    .from('products')
    .select('id, name, price, image_url, ingredients, allergens')
    .eq('is_featured', true)
    .order('sort_order', { ascending: true })
  featured.value = (data ?? []).map(p => ({ ...p, allergens: p.allergens ?? [] }))
  loading.value = false
})
</script>

<template>
  <section class="featured" style="background: var(--pink-bg)">
    <h2 class="section-title">Våra favoriter</h2>

    <div v-if="loading" class="featured__loading">
      <div class="featured__spinner" />
    </div>

    <p v-else-if="!featured.length" class="featured__empty">
      Inga favoriter valda ännu.
    </p>

    <div v-else class="featured__grid">
      <div v-for="item in featured" :key="item.id" class="featured__card">
        <div class="featured__img-wrap">
          <img :src="item.image_url" :alt="item.name" class="featured__img" />
          <div class="featured__overlay">
            <button class="featured__icon-btn" title="Lägg i varukorg">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </button>
            <button
              v-if="item.ingredients || item.allergens.length"
              class="featured__icon-btn"
              title="Ingredienser & allergener"
              @click="selectedProduct = item"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </button>
            <button class="featured__icon-btn" title="Favorit">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="featured__info">
          <p class="featured__name">{{ item.name }}</p>
          <p class="featured__price">{{ item.price }} kr</p>
        </div>
      </div>
    </div>

    <!-- Info modal -->
    <Teleport to="body">
      <div v-if="selectedProduct" class="info-overlay" @click.self="selectedProduct = null">
        <div class="info-modal">
          <div class="info-modal__img-wrap">
            <img :src="selectedProduct.image_url" :alt="selectedProduct.name" class="info-modal__img" />
            <button class="info-modal__close" @click="selectedProduct = null">✕</button>
          </div>
          <div class="info-modal__body">
            <div class="info-modal__top">
              <h3 class="info-modal__name">{{ selectedProduct.name }}</h3>
              <span class="info-modal__price">{{ selectedProduct.price }} kr</span>
            </div>
            <div v-if="selectedProduct.ingredients" class="info-modal__section">
              <h4 class="info-modal__label">Ingredienser</h4>
              <p class="info-modal__text">{{ selectedProduct.ingredients }}</p>
            </div>
            <div v-if="selectedProduct.allergens.length" class="info-modal__section">
              <h4 class="info-modal__label">Allergener</h4>
              <div class="info-modal__allergens">
                <span v-for="a in selectedProduct.allergens" :key="a" class="allergen-badge">{{ a }}</span>
              </div>
              <p class="info-modal__allergen-note">Kan innehålla spår av andra allergener. Kontakta oss vid frågor.</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.featured__loading { display: flex; justify-content: center; padding: 60px 0; }

.featured__spinner {
  width: 36px; height: 36px;
  border: 3px solid var(--pink-light); border-top-color: var(--pink);
  border-radius: 50%; animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.featured__empty { text-align: center; color: var(--gray); padding: 40px 0; font-size: 0.95rem; }

.featured__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  max-width: 1100px;
  margin: 0 auto;
}

.featured__card {
  background: var(--white);
  border-radius: 16px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}
.featured__card:hover { box-shadow: 0 8px 28px rgba(233, 30, 140, 0.15); }

.featured__img-wrap { position: relative; overflow: hidden; }

.featured__img {
  width: 100%; height: 180px; object-fit: cover; transition: transform 0.4s;
}
.featured__card:hover .featured__img { transform: scale(1.06); }

.featured__overlay {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.5));
  display: flex; justify-content: center; gap: 12px; padding: 12px;
  opacity: 0; transition: opacity 0.3s;
}
.featured__card:hover .featured__overlay { opacity: 1; }

.featured__icon-btn {
  background: var(--white); border: none;
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--dark); transition: background 0.2s, color 0.2s;
}
.featured__icon-btn:hover { background: var(--pink); color: var(--white); }

.featured__info { padding: 14px 16px; text-align: center; }

.featured__name { font-weight: 600; font-size: 0.9rem; color: var(--dark); margin-bottom: 4px; }

.featured__price { color: var(--pink); font-weight: 700; font-size: 0.95rem; }

/* Info modal — same as BestSales */
.info-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 300; padding: 24px;
}

.info-modal {
  background: var(--white); border-radius: 20px;
  width: 100%; max-width: 420px; overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  animation: modal-in 0.2s ease;
}

@keyframes modal-in {
  from { transform: scale(0.95); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}

.info-modal__img-wrap { position: relative; }
.info-modal__img { width: 100%; height: 220px; object-fit: cover; display: block; }

.info-modal__close {
  position: absolute; top: 10px; right: 10px;
  width: 30px; height: 30px;
  background: rgba(255,255,255,0.9); border: none; border-radius: 50%;
  font-size: 0.85rem; color: var(--dark); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.info-modal__close:hover { background: white; }

.info-modal__body { padding: 20px 24px 28px; display: flex; flex-direction: column; gap: 16px; }

.info-modal__top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }

.info-modal__name { font-family: var(--font-display); font-size: 1.3rem; color: var(--dark); }
.info-modal__price { font-size: 1.1rem; font-weight: 700; color: var(--pink); white-space: nowrap; }

.info-modal__section { display: flex; flex-direction: column; gap: 6px; }

.info-modal__label {
  font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--gray);
}

.info-modal__text { font-size: 0.9rem; color: var(--dark); line-height: 1.6; }

.info-modal__allergens { display: flex; flex-wrap: wrap; gap: 6px; }

.allergen-badge {
  background: #fff3e0; color: #92400e;
  font-size: 0.78rem; font-weight: 700;
  padding: 4px 10px; border-radius: 20px;
}

.info-modal__allergen-note { font-size: 0.75rem; color: var(--gray); font-style: italic; }

@media (max-width: 640px) { .featured__grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 641px) and (max-width: 900px) { .featured__grid { grid-template-columns: repeat(2, 1fr); } }
</style>
