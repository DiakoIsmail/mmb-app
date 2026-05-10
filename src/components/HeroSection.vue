<script setup lang="ts"></script>

<template>
  <section class="hero">
    <div class="hero__content">
      <p class="hero__suggestion">Vi förverkligar din drömtårta och bakelser</p>
      <h1 class="hero__title">
        Mandy´s <span class="hero__title--pink">Magic Bakery </span>
      </h1>
      <p class="hero__desc">
        Canada's most delicious cupcakes for business meetings, birthdays,
        weddings. Our cupcakes are baked daily using the finest ingredients.
      </p>
      <div class="hero__cta">
        <button class="btn btn--dark">Våra kreationer</button>
        <a href="" class="hero__phone">
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            viewBox="0 0 24 24"
          >
            <!-- cake layers -->
            <rect x="2" y="14" width="20" height="7" rx="1" />
            <rect x="5" y="9" width="14" height="5" rx="1" />
            <!-- candles -->
            <line x1="8" y1="9" x2="8" y2="6" />
            <line x1="12" y1="9" x2="12" y2="5" />
            <line x1="16" y1="9" x2="16" y2="6" />
            <!-- flames -->
            <circle cx="8" cy="5.5" r="0.8" fill="currentColor" stroke="none" />
            <circle
              cx="12"
              cy="4.5"
              r="0.8"
              fill="currentColor"
              stroke="none"
            />
            <circle
              cx="16"
              cy="5.5"
              r="0.8"
              fill="currentColor"
              stroke="none"
            />
          </svg>
          <span class="hero__stat-number">500+</span>
          <span class="hero__stat-label">utförda beställningar</span>
        </a>
      </div>
      <p class="hero__title--sm">
        <span class="hero__scroll--dark">Just nu tar vi</span>
        <span class="hero__scroll--pink"> 3 beställning</span>
      </p>
    </div>
    <div class="hero__image-wrap">
      <div class="hero__blob"></div>
      <img
        src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=520&q=80"
        alt="Mandy´s Magic Bakery"
        class="hero__image"
      />
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 40px;
  padding: 60px 24px 40px;
  background: linear-gradient(135deg, #fff5fa 0%, #ffffff 60%);
  min-height: 520px;
}

.hero__suggestion {
  font-size: 0.85rem;
  color: var(--pink);
  font-weight: 600;
  letter-spacing: 0.04em;
  margin-bottom: 10px;
}

.hero__title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1.1;
  color: var(--dark);
  margin-bottom: 16px;
}
.hero__title--pink {
  color: var(--pink);
}

.hero__title--sm {
  font-family: var(--font-display);
  font-size: clamp(1rem, 2vw, 1.5rem);
  line-height: 1.2;
  color: var(--dark);
}

.hero__desc {
  font-size: 0.95rem;
  color: var(--gray);
  max-width: 380px;
  margin-bottom: 28px;
  line-height: 1.7;
}

.hero__cta {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.btn {
  padding: 12px 28px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s;
}
.btn--dark {
  background: var(--dark);
  color: var(--white);
}
.btn--dark:hover {
  background: var(--pink);
}

.hero__phone {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--pink);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: default;
}

.hero__stat-number {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--dark);
}

.hero__stat-label {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--gray);
}

.hero__scroll {
  font-size: 0.8rem;
  letter-spacing: 0.06em;
}

.hero__scroll--dark {
  color: var(--dark);
  font-weight: 600;
}

.hero__scroll--pink {
  color: var(--pink);
  font-weight: 700;
}

.hero__image-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero__blob {
  position: absolute;
  width: 380px;
  height: 380px;
  background: radial-gradient(circle, #fce4f0 0%, #f8bbd9 50%, transparent 70%);
  border-radius: 50%;
  z-index: 0;
}

.hero__image {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 460px;
  object-fit: contain;
  filter: drop-shadow(0 20px 40px rgba(233, 30, 140, 0.2));
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 40px 16px;
  }
  .hero__desc {
    margin: 0 auto 28px;
  }
  .hero__cta {
    justify-content: center;
  }
  .hero__scroll {
    text-align: center;
  }
  .hero__image-wrap {
    order: -1;
  }
  .hero__blob {
    width: 280px;
    height: 280px;
  }
  .hero__image {
    max-width: 300px;
  }
}
</style>
