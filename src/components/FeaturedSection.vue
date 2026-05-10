<script setup lang="ts">
interface Product {
  id: number
  name: string
  price: string
  image: string
}

const featured: Product[] = [
  { id: 1, name: 'Strawberry Cupcake', price: '$6.50', image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=300&q=80' },
  { id: 2, name: 'Mint Cupcake', price: '$6.00', image: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=300&q=80' },
  { id: 3, name: 'Caramel Cupcake', price: '$6.50', image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=300&q=80' },
  { id: 4, name: 'Berry Cupcake', price: '$7.00', image: 'https://images.unsplash.com/photo-1599785209707-a456fc2b2b11?w=300&q=80' },
]
</script>

<template>
  <section class="featured" style="background: var(--pink-bg);">
    <h2 class="section-title">Our Featured</h2>
    <div class="featured__grid">
      <div v-for="item in featured" :key="item.id" class="featured__card">
        <div class="featured__img-wrap">
          <img :src="item.image" :alt="item.name" class="featured__img" />
          <div class="featured__overlay">
            <button class="featured__icon-btn" title="Add to cart">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </button>
            <button class="featured__icon-btn" title="Search">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
            <button class="featured__icon-btn" title="Wishlist">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="featured__info">
          <p class="featured__name">{{ item.name }}</p>
          <p class="featured__price">{{ item.price }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
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
  transition: box-shadow .3s;
}
.featured__card:hover { box-shadow: 0 8px 28px rgba(233,30,140,.15); }

.featured__img-wrap {
  position: relative;
  overflow: hidden;
}

.featured__img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  transition: transform .4s;
}
.featured__card:hover .featured__img { transform: scale(1.06); }

.featured__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,.5));
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  opacity: 0;
  transition: opacity .3s;
}
.featured__card:hover .featured__overlay { opacity: 1; }

.featured__icon-btn {
  background: var(--white);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dark);
  transition: background .2s, color .2s;
}
.featured__icon-btn:hover { background: var(--pink); color: var(--white); }

.featured__info {
  padding: 14px 16px;
  text-align: center;
}

.featured__name {
  font-weight: 600;
  font-size: .9rem;
  color: var(--dark);
  margin-bottom: 4px;
}

.featured__price {
  color: var(--pink);
  font-weight: 700;
  font-size: .95rem;
}

@media (max-width: 640px) {
  .featured__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 641px) and (max-width: 900px) {
  .featured__grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
