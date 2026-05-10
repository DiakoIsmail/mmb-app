<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <section class="dozen">
    <div class="dozen__inner">
      <div class="dozen__content">
        <h2 class="dozen__title">Möt Mandy</h2>
        <p class="dozen__price">
          Bakom varje tårta finns en passion. Läs om hur allt började — från
          hemmaköket till drömbakeriet.
        </p>
        <button class="btn btn--order" @click="router.push('/var-berattelse')">
          Vår berättelse
        </button>
      </div>
      <div class="dozen__img-wrap">
        <img
          src="../assets/images/manys/mandy_m_torta.jpg"
          alt="Amanda, grundare av Mandy's Magic Bakery"
          class="dozen__img"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.dozen {
  padding: 0 24px 60px;
}

.dozen__inner {
  background: linear-gradient(135deg, #fce4f0 0%, #fdf0e6 100%);
  border-radius: 24px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 40px;
  padding: 48px 56px;
  max-width: 1100px;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
}

.dozen__title {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 3vw, 2.2rem);
  color: var(--dark);
  margin-bottom: 12px;
}

.dozen__desc {
  font-size: 0.95rem;
  color: var(--gray);
  max-width: 380px;
  line-height: 1.7;
  margin-bottom: 16px;
}

.dozen__price {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--pink);
  margin-bottom: 32px;
}

.btn--order {
  background: var(--dark);
  color: var(--white);
  padding: 14px 36px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  transition:
    background 0.2s,
    transform 0.2s;
}
.btn--order:hover {
  background: var(--pink);
  transform: translateY(-2px);
}

.dozen__img-wrap {
  flex-shrink: 0;
}

.dozen__img {
  width: 240px;
  height: 340px;
  object-fit: cover;
  object-position: top center;
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(233, 30, 140, 0.2);
  display: block;
}

@media (max-width: 768px) {
  .dozen__inner {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 36px 24px;
    gap: 28px;
  }
  .dozen__img {
    width: 180px;
    height: 260px;
    border-radius: 14px;
    margin: 0 auto;
  }
}
</style>
