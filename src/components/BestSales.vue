<script setup lang="ts">
import { ref } from 'vue'

interface SaleProduct {
  id: number
  name: string
  price: string
  image: string
  qty: number
}

const products = ref<SaleProduct[]>([
  { id: 1, name: 'Sweet Bread', price: '$17.00', image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=200&q=80', qty: 1 },
  { id: 2, name: 'Sweet Cake', price: '$18.00', image: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=200&q=80', qty: 1 },
  { id: 3, name: 'Soufflé Cake', price: '$19.00', image: 'https://images.unsplash.com/photo-1605807646983-377bc5a76493?w=200&q=80', qty: 1 },
  { id: 4, name: 'Chocolate Cake', price: '$20.00', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&q=80', qty: 1 },
  { id: 5, name: 'Muffin', price: '$17.00', image: 'https://images.unsplash.com/photo-1558303648-7dc46f2e5745?w=200&q=80', qty: 1 },
  { id: 6, name: 'Party Cupcake', price: '$21.00', image: 'https://images.unsplash.com/photo-1599785209707-a456fc2b2b11?w=200&q=80', qty: 1 },
  { id: 7, name: 'Meringue Cake', price: '$19.00', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&q=80', qty: 1 },
  { id: 8, name: 'Spider Cupcakes', price: '$18.00', image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=200&q=80', qty: 1 },
])

function decrement(p: SaleProduct) { if (p.qty > 1) p.qty-- }
function increment(p: SaleProduct) { p.qty++ }
</script>

<template>
  <section class="sales">
    <h2 class="section-title">Best Sales</h2>
    <div class="sales__grid">
      <div v-for="p in products" :key="p.id" class="sales__card">
        <img :src="p.image" :alt="p.name" class="sales__img" />
        <p class="sales__name">{{ p.name }}</p>
        <div class="sales__row">
          <span class="sales__price">{{ p.price }}</span>
          <div class="sales__qty">
            <button class="qty-btn" @click="decrement(p)">&#8722;</button>
            <span class="qty-num">{{ p.qty }}</span>
            <button class="qty-btn" @click="increment(p)">&#43;</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sales { background: var(--white); }

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
  transition: box-shadow .3s, transform .3s;
  text-align: center;
}
.sales__card:hover { box-shadow: 0 8px 28px rgba(233,30,140,.14); transform: translateY(-4px); }

.sales__img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  transition: transform .4s;
}
.sales__card:hover .sales__img { transform: scale(1.05); }

.sales__name {
  font-size: .88rem;
  font-weight: 600;
  color: var(--dark);
  padding: 10px 8px 4px;
}

.sales__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 14px;
}

.sales__price {
  color: var(--pink);
  font-weight: 700;
  font-size: .9rem;
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
  font-size: .9rem;
  color: var(--dark);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .2s, color .2s;
}
.qty-btn:hover { background: var(--pink); color: var(--white); }

.qty-num {
  font-size: .85rem;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
}

@media (max-width: 640px) {
  .sales__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 641px) and (max-width: 900px) {
  .sales__grid { grid-template-columns: repeat(3, 1fr); }
}
</style>
