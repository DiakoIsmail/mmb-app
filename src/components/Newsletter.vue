<script setup lang="ts">
import { ref } from "vue";

const email = ref("");
const submitted = ref(false);

function subscribe() {
  if (email.value.trim()) {
    submitted.value = true;
    email.value = "";
    setTimeout(() => {
      submitted.value = false;
    }, 3000);
  }
}
</script>

<template>
  <section class="newsletter">
    <h2 class="section-title">Our Newsletter</h2>
    <p class="newsletter__sub">
      Join our list and get 15% off your first purchase! Don't worry we don't
      spam
    </p>
    <div class="newsletter__form">
      <input
        v-model="email"
        type="email"
        placeholder="Enter your email..."
        class="newsletter__input"
        @keyup.enter="subscribe"
      />
      <button class="btn btn--subscribe" @click="subscribe">Subscribe</button>
    </div>
    <p v-if="submitted" class="newsletter__success">Thanks for subscribing!</p>
  </section>
</template>

<style scoped>
.newsletter {
  background: var(--white);
  text-align: center;
}

.newsletter__sub {
  font-size: 0.95rem;
  color: var(--gray);
  margin-bottom: 28px;
}

.newsletter__form {
  display: flex;
  justify-content: center;
  gap: 0;
  max-width: 500px;
  margin: 0 auto;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(233, 30, 140, 0.1);
}

.newsletter__input {
  flex: 1;
  padding: 14px 20px;
  border: 1px solid #f0dcea;
  border-right: none;
  border-radius: 10px 0 0 10px;
  font-size: 0.95rem;
  font-family: var(--font-body);
  color: var(--dark);
  outline: none;
  transition: border-color 0.2s;
}
.newsletter__input:focus {
  border-color: var(--pink);
}

.btn--subscribe {
  background: var(--pink);
  color: var(--white);
  padding: 14px 28px;
  border-radius: 0 10px 10px 0;
  font-size: 0.95rem;
  font-weight: 700;
  white-space: nowrap;
  transition: background 0.2s;
}
.btn--subscribe:hover {
  background: #c0166f;
}

.newsletter__success {
  margin-top: 14px;
  color: var(--pink);
  font-weight: 600;
  font-size: 0.9rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .newsletter__form {
    flex-direction: column;
    border-radius: 10px;
  }
  .newsletter__input {
    border-right: 1px solid #f0dcea;
    border-bottom: none;
    border-radius: 10px 10px 0 0;
  }
  .btn--subscribe {
    border-radius: 0 0 10px 10px;
  }
}
</style>
