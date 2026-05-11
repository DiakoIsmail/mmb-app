<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<template>
  <section class="biz">
    <div class="biz__inner">
      <div class="biz__icon-wrap">
        <svg
          width="48"
          height="48"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
      <div class="biz__content">
        <p class="biz__label">Företagsbeställningar</p>
        <h2 class="biz__title">Beställ till din butik eller restaurang</h2>
        <p class="biz__desc">
          Vi levererar färska bakelser, tårtor och kakor i bulk direkt till
          kaféer, butiker och restauranger. Anpassade sortiment och flexibla
          leveransscheman.
        </p>
        <button class="btn btn--biz" @click="router.push('/foretag')">
          Se information &amp; kontakt
        </button>
      </div>
      <div class="biz__badges">
        <span class="biz__badge">Grossistpriser</span>
        <span class="biz__badge">Skräddarsytt sortiment</span>
        <span class="biz__badge">Regelbunden leverans</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.biz {
  padding: 0 24px 60px;
}

.biz__inner {
  background: linear-gradient(135deg, var(--dark) 0%, #2a1a2e 100%);
  border-radius: 24px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 52px 56px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 40px;
  position: relative;
  overflow: hidden;
}

.biz__inner::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 80% 50%,
    rgba(233, 30, 140, 0.15) 0%,
    transparent 60%
  );
  pointer-events: none;
}

.biz__icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: rgba(233, 30, 140, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--pink);
  flex-shrink: 0;
}

.biz__label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--pink);
  margin-bottom: 8px;
}

.biz__title {
  font-family: var(--font-display);
  font-size: clamp(1.3rem, 2.5vw, 2rem);
  color: var(--white);
  margin-bottom: 12px;
  line-height: 1.25;
}

.biz__desc {
  font-size: 0.92rem;
  color: rgba(255, 255, 255, 0.65);
  max-width: 420px;
  line-height: 1.75;
  margin-bottom: 28px;
}

.btn--biz {
  background: var(--pink);
  color: var(--white);
  padding: 13px 32px;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 700;
  transition:
    background 0.2s,
    transform 0.2s;
  white-space: nowrap;
}
.btn--biz:hover {
  background: #c0166f;
  transform: translateY(-2px);
}

.biz__badges {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
}

.biz__badge {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 20px;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .biz__inner {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 40px 28px;
    gap: 24px;
  }
  .biz__icon-wrap {
    margin: 0 auto;
  }
  .biz__desc {
    margin: 0 auto 24px;
  }
  .biz__badges {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
