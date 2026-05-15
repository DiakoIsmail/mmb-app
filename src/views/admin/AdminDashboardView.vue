<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuth, signOut } from '../../composables/useAuth'

const router = useRouter()
const route = useRoute()
const { user } = useAuth()

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
        <a class="sidebar-link" href="#">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="2"/>
          </svg>
          Beställningar
        </a>
        <a class="sidebar-link" href="#">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          Kunder
        </a>
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
            <p class="stat-label">Nya beställningar</p>
            <p class="stat-value">—</p>
            <p class="stat-sub">Kommer snart</p>
          </div>
          <div class="stat-card">
            <p class="stat-label">Aktiva kunder</p>
            <p class="stat-value">—</p>
            <p class="stat-sub">Kommer snart</p>
          </div>
          <div class="stat-card">
            <p class="stat-label">Veckans försäljning</p>
            <p class="stat-value">—</p>
            <p class="stat-sub">Kommer snart</p>
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

@media (max-width: 768px) {
  .admin-sidebar { display: none; }
  .stats-grid { grid-template-columns: 1fr; }
  .admin-content { padding: 20px 16px; }
}
</style>
