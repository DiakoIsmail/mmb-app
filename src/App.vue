<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import FooterSection from './components/FooterSection.vue'
import ShoppingCart from './components/ShoppingCart.vue'
import { initAuth } from './composables/useAuth'
import { initOrderSettings } from './composables/useOrderSettings'

initAuth().catch(() => {})
initOrderSettings().catch(() => {})

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
</script>

<template>
  <div :class="['app', { 'app--admin': isAdminRoute }]">
    <template v-if="!isAdminRoute">
      <NavBar />
      <RouterView />
      <FooterSection />
      <ShoppingCart />
    </template>
    <template v-else>
      <RouterView />
    </template>
  </div>
</template>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --pink: #e91e8c;
  --pink-light: #f8bbd9;
  --pink-bg: #fdf0f6;
  --dark: #1a1a2e;
  --gray: #6b7280;
  --white: #ffffff;
  --font-body: 'Inter', sans-serif;
  --font-display: 'Playfair Display', serif;
}

body {
  font-family: var(--font-body);
  color: var(--dark);
  background: var(--white);
  line-height: 1.5;
}

.app {
  max-width: 1280px;
  margin: 0 auto;
  overflow-x: hidden;
}

.app--admin {
  max-width: 100%;
  margin: 0;
}

img { max-width: 100%; height: auto; display: block; }

a { text-decoration: none; color: inherit; }

button {
  cursor: pointer;
  font-family: var(--font-body);
  border: none;
  outline: none;
}

section { padding: 60px 24px; }

@media (max-width: 768px) {
  section { padding: 40px 16px; }
}
</style>
