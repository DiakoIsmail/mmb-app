<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import cupcake from "../assets/buttonlogo/cupcake_logo.png";
import cake_cake from "../assets/buttonlogo/tarta_logo.png";
import magic_cake from "../assets/buttonlogo/magic_tårta.png";
import { useOrderSettings } from "../composables/useOrderSettings";

interface Event {
  id: number;
  name: string;
  type: string;
  image: string;
  enabledKey: "bakeselEnabled" | "tartaEnabled" | "magiEnabled";
}

const { bakeselEnabled, tartaEnabled, magiEnabled } = useOrderSettings();

const allEvents: Event[] = [
  { id: 1, name: "Bakelse", type: "bakelse", image: cupcake, enabledKey: "bakeselEnabled" },
  { id: 2, name: "Tårta", type: "tarta", image: cake_cake, enabledKey: "tartaEnabled" },
  { id: 3, name: "Magi", type: "magi", image: magic_cake, enabledKey: "magiEnabled" },
];

const enabledMap = { bakeselEnabled, tartaEnabled, magiEnabled };

const events = computed(() =>
  allEvents.filter((ev) => enabledMap[ev.enabledKey].value)
);

const router = useRouter();
</script>

<template>
  <section class="events">
    <h2 class="section-title">Skapa &amp; Beställ</h2>
    <div class="events__grid" :class="`events__grid--${events.length}`" v-if="events.length">
      <div
        v-for="ev in events"
        :key="ev.id"
        class="events__card"
        @click="router.push(`/bestall/${ev.type}`)"
      >
        <img :src="ev.image" :alt="ev.name" class="events__img" />
        <p class="events__name">{{ ev.name }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.events {
  background: var(--white);
}

.section-title {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 3vw, 2rem);
  text-align: center;
  margin-bottom: 36px;
  color: var(--dark);
}

.events__grid {
  display: grid;
  gap: 24px;
  max-width: 900px;
  margin: 0 auto;
  justify-content: center;
}

.events__grid--1 {
  grid-template-columns: minmax(0, 280px);
}

.events__grid--2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  max-width: 620px;
}

.events__grid--3 {
  grid-template-columns: repeat(3, 1fr);
}

.events__card {
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
.events__card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(233, 30, 140, 0.15);
}

.events__img {
  width: 100%;
  height: 320px;
  object-fit: cover;
  transition: transform 0.4s;
}
.events__card:hover .events__img {
  transform: scale(1.05);
}

.events__name {
  text-align: center;
  padding: 12px 8px;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--dark);
  background: var(--white);
}

@media (max-width: 640px) {
  .events__grid {
    grid-template-columns: 1fr;
    max-width: 320px;
  }
  .events__img {
    height: 380px;
  }
}

@media (min-width: 641px) and (max-width: 900px) {
  .events__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
