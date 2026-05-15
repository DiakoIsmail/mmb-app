<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInAsAdmin } from '../../composables/useAuth'

const router = useRouter()
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    await signInAsAdmin(email.value, password.value)
    await router.push('/admin/dashboard')
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Inloggningen misslyckades.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <img
        src="../../assets/logos/mandys-logo_.png"
        alt="Mandy's Magic Bakery"
        class="login-logo"
      />
      <h1 class="login-title">Admin</h1>
      <p class="login-subtitle">Logga in för att hantera butiken</p>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="login-field">
          <label for="email">E-postadress</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="admin@example.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="login-field">
          <label for="password">Lösenord</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>

        <p v-if="errorMsg" class="login-error">{{ errorMsg }}</p>

        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="loading" class="login-spinner" />
          <span v-else>Logga in</span>
        </button>
      </form>

      <RouterLink to="/" class="login-back">← Tillbaka till butiken</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--pink-bg);
  padding: 24px;
}

.login-card {
  background: var(--white);
  border-radius: 20px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 40px rgba(233, 30, 140, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.login-logo {
  height: 64px;
  width: auto;
  margin-bottom: 8px;
}

.login-title {
  font-family: var(--font-display);
  font-size: 2rem;
  color: var(--dark);
}

.login-subtitle {
  font-size: 0.9rem;
  color: var(--gray);
  margin-bottom: 16px;
}

.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 8px;
}

.login-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.login-field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--dark);
}

.login-field input {
  padding: 12px 16px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  font-family: var(--font-body);
  color: var(--dark);
  outline: none;
  transition: border-color 0.2s;
}

.login-field input:focus {
  border-color: var(--pink);
}

.login-error {
  font-size: 0.875rem;
  color: #dc2626;
  background: #fef2f2;
  border-radius: 8px;
  padding: 10px 14px;
  text-align: center;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: var(--pink);
  color: var(--white);
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.2s, opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
}

.login-btn:hover:not(:disabled) { background: #c9186e; }
.login-btn:disabled { opacity: 0.7; }

.login-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.login-back {
  margin-top: 16px;
  font-size: 0.875rem;
  color: var(--gray);
  transition: color 0.2s;
}

.login-back:hover { color: var(--pink); }

@media (max-width: 480px) {
  .login-card { padding: 36px 24px; }
}
</style>
