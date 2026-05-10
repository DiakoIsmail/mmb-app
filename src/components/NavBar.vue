<script setup lang="ts">
import { ref } from "vue";

const menuOpen = ref(false);
const navLinks = ["Cupcakes", "Events", "About", "Contact Us"];
</script>

<template>
  <header class="navbar">
    <div class="navbar__inner">
      <RouterLink to="/" class="navbar__logo">
        <img
          src="../assets/logos/mandys-logo_.png"
          alt="Mandy's Magic Bakery"
          class="navbar__logo-img"
        />
        <span class="navbar__logo-text">Mandy´s</span>
      </RouterLink>

      <nav class="navbar__links" :class="{ 'navbar__links--open': menuOpen }">
        <a v-for="link in navLinks" :key="link" href="#" class="navbar__link">{{
          link
        }}</a>
        <RouterLink
          to="/instagram"
          class="navbar__link navbar__link--ig"
          @click="menuOpen = false"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
            />
          </svg>
          Instagram
        </RouterLink>
      </nav>

      <div class="navbar__actions">
        <button class="navbar__icon-btn" aria-label="Cart">
          <svg
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        </button>
        <button class="navbar__icon-btn" aria-label="Account">
          <svg
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
        <button
          class="navbar__hamburger"
          :class="{ 'navbar__hamburger--open': menuOpen }"
          @click="menuOpen = !menuOpen"
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--white);
  box-shadow: 0 2px 12px rgba(233, 30, 140, 0.08);
}

.navbar__inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
}

.navbar__logo {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: 0.08em;
  color: var(--dark);
}

.navbar__logo-icon {
  color: var(--pink);
  font-size: 1rem;
}

.navbar__logo-img {
  height: 48px;
  width: auto;
  object-fit: contain;
  display: block;
}

.navbar__links {
  display: flex;
  gap: 36px;
}

.navbar__link {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--dark);
  transition: color 0.2s;
}
.navbar__link:hover {
  color: var(--pink);
}

.navbar__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar__icon-btn {
  background: none;
  border: none;
  color: var(--dark);
  padding: 4px;
  transition: color 0.2s;
}
.navbar__icon-btn:hover {
  color: var(--pink);
}

.navbar__hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  padding: 4px;
}
.navbar__hamburger span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--dark);
  border-radius: 2px;
  transition: all 0.3s;
}

@media (max-width: 768px) {
  .navbar__hamburger {
    display: flex;
  }

  .navbar__links {
    display: none;
    position: absolute;
    top: 65px;
    left: 0;
    right: 0;
    background: var(--white);
    flex-direction: column;
    gap: 0;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
  .navbar__links--open {
    display: flex;
  }

  .navbar__link {
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;
  }
}
</style>
