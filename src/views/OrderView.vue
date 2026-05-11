<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const typeParam = computed(() => route.params.type as string);

const typeLabel = computed(() => {
  const map: Record<string, string> = {
    bakelse: "Bakelse",
    tarta: "Tårta",
    magi: "Magi",
  };
  return map[typeParam.value] ?? "Bakelse";
});

const flavors = [
  { id: "vanilj", label: "Vanilj", icon: "🍦" },
  { id: "choklad", label: "Choklad", icon: "🍫" },
  { id: "jordgubb", label: "Jordgubb", icon: "🍓" },
  { id: "citron", label: "Citron", icon: "🍋" },
  { id: "hallon", label: "Hallon", icon: "🫐" },
  { id: "karamell", label: "Karamell", icon: "🍯" },
  { id: "blabar", label: "Blåbär", icon: "💜" },
  { id: "mango", label: "Mango", icon: "🥭" },
  { id: "pistasch", label: "Pistasch", icon: "🌿" },
];

const occasions = [
  { id: "fodelsedag", label: "Födelsedag", icon: "🎂" },
  { id: "brollop", label: "Bröllop", icon: "💍" },
  { id: "baby-shower", label: "Baby Shower", icon: "🍼" },
  { id: "student", label: "Student", icon: "🎓" },
  { id: "annat", label: "Annat", icon: "✨" },
];

const presetMotifs = [
  { id: "blommor", label: "Blommor", icon: "🌸" },
  { id: "stjarnor", label: "Stjärnor", icon: "⭐" },
  { id: "hjärtan", label: "Hjärtan", icon: "❤️" },
  { id: "djur", label: "Djur", icon: "🐾" },
  { id: "minimalistisk", label: "Minimalistisk", icon: "✨" },
  { id: "eget", label: "Eget motiv", icon: "✍️" },
];

const selectedFlavors = ref<string[]>([]);
const cakeText = ref("");
const selectedOccasion = ref("");
const selectedMotif = ref("");
const customMotif = ref("");

const isCustomMotif = computed(() => selectedMotif.value === "eget");

function toggleFlavor(id: string) {
  const idx = selectedFlavors.value.indexOf(id);
  if (idx >= 0) selectedFlavors.value.splice(idx, 1);
  else selectedFlavors.value.push(id);
}

function selectOccasion(id: string) {
  selectedOccasion.value = selectedOccasion.value === id ? "" : id;
}

function selectMotif(id: string) {
  selectedMotif.value = selectedMotif.value === id ? "" : id;
  if (id !== "eget") customMotif.value = "";
}

function submit() {
  const order = {
    type: typeLabel.value,
    flavors: selectedFlavors.value,
    text: cakeText.value,
    occasion: selectedOccasion.value,
    motif: isCustomMotif.value ? customMotif.value : selectedMotif.value,
  };
  console.log("Beställning:", order);
  // TODO: skicka till backend
}
</script>

<template>
  <div class="order-page">
    <div class="order-header">
      <button class="back-btn" @click="router.back()">← Tillbaka</button>
      <h1 class="order-title">Anpassa din {{ typeLabel }}</h1>
      <p class="order-subtitle">
        Välj smaker, motiv och mer — vi skapar din perfekta
        {{ typeLabel.toLowerCase() }}
      </p>
    </div>

    <div class="order-content">
      <!-- Smaker -->
      <div class="order-section">
        <h2 class="section-label">Smaker</h2>
        <p class="section-hint">Välj en eller flera</p>
        <div class="pill-grid">
          <button
            v-for="f in flavors"
            :key="f.id"
            class="pill"
            :class="{ 'pill--active': selectedFlavors.includes(f.id) }"
            @click="toggleFlavor(f.id)"
          >
            <span class="pill__icon">{{ f.icon }}</span>
            <span class="pill__label">{{ f.label }}</span>
          </button>
        </div>
      </div>

      <!-- Text -->
      <div class="order-section">
        <h2 class="section-label">Text på {{ typeLabel.toLowerCase() }}</h2>
        <p class="section-hint">
          Valfritt — t.ex. "Grattis Lisa!" eller "5 år"
        </p>
        <div class="input-wrap">
          <input
            v-model="cakeText"
            class="text-input"
            type="text"
            placeholder="Skriv önskad text..."
            maxlength="60"
          />
          <span class="char-count">{{ cakeText.length }}/60</span>
        </div>
      </div>

      <!-- Tillfälle -->
      <div class="order-section">
        <h2 class="section-label">Tillfälle</h2>
        <div class="pill-row">
          <button
            v-for="occ in occasions"
            :key="occ.id"
            class="pill"
            :class="{ 'pill--active': selectedOccasion === occ.id }"
            @click="selectOccasion(occ.id)"
          >
            <span class="pill__icon">{{ occ.icon }}</span>
            <span class="pill__label">{{ occ.label }}</span>
          </button>
        </div>
      </div>

      <!-- Motiv -->
      <div class="order-section">
        <h2 class="section-label">Motiv</h2>
        <p class="section-hint">Välj ett grundmotiv eller beskriv ett eget</p>
        <div class="pill-row">
          <button
            v-for="m in presetMotifs"
            :key="m.id"
            class="pill"
            :class="{ 'pill--active': selectedMotif === m.id }"
            @click="selectMotif(m.id)"
          >
            <span class="pill__icon">{{ m.icon }}</span>
            <span class="pill__label">{{ m.label }}</span>
          </button>
        </div>
        <textarea
          v-if="isCustomMotif"
          v-model="customMotif"
          class="motif-textarea"
          placeholder="Beskriv ditt motiv här — färger, figurer, känsla..."
          rows="3"
          maxlength="300"
        />
      </div>

      <button class="submit-btn" @click="submit">Skicka beställning ✨</button>
    </div>
  </div>
</template>

<style scoped>
.order-page {
  min-height: 100vh;
  background: var(--pink-bg);
}

.order-header {
  background: var(--white);
  padding: 40px 24px 36px;
  text-align: center;
  border-bottom: 1px solid var(--pink-light);
  position: relative;
}

.back-btn {
  position: absolute;
  left: 24px;
  top: 40px;
  background: none;
  color: var(--pink);
  font-size: 0.95rem;
  font-weight: 600;
  padding: 8px 0;
  transition: opacity 0.2s;
}
.back-btn:hover {
  opacity: 0.7;
}

.order-title {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  color: var(--dark);
  margin-bottom: 10px;
}

.order-subtitle {
  color: var(--gray);
  font-size: 0.95rem;
}

.order-content {
  max-width: 760px;
  margin: 0 auto;
  padding: 40px 24px 80px;
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.order-section {
  background: var(--white);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.section-label {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--dark);
  margin-bottom: 6px;
}

.section-hint {
  font-size: 0.85rem;
  color: var(--gray);
  margin-bottom: 20px;
}

/* Pills */
.pill-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 100px;
  border: 2px solid var(--pink-light);
  background: var(--white);
  color: var(--dark);
  font-size: 0.9rem;
  font-weight: 500;
  transition:
    background 0.2s,
    border-color 0.2s,
    color 0.2s,
    transform 0.15s;
}
.pill:hover {
  border-color: var(--pink);
  transform: translateY(-2px);
}
.pill--active {
  background: var(--pink);
  border-color: var(--pink);
  color: var(--white);
}

.pill__icon {
  font-size: 1.1rem;
  line-height: 1;
}

.pill__label {
  white-space: nowrap;
}

/* Text input */
.input-wrap {
  position: relative;
}

.text-input {
  width: 100%;
  padding: 14px 60px 14px 18px;
  border: 2px solid var(--pink-light);
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: var(--font-body);
  color: var(--dark);
  outline: none;
  transition: border-color 0.2s;
  background: var(--white);
}
.text-input:focus {
  border-color: var(--pink);
}
.text-input::placeholder {
  color: #bdbdbd;
}

.char-count {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.78rem;
  color: var(--gray);
  pointer-events: none;
}

/* Motiv textarea */
.motif-textarea {
  width: 100%;
  margin-top: 16px;
  padding: 14px 18px;
  border: 2px solid var(--pink-light);
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: var(--font-body);
  color: var(--dark);
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
  background: var(--white);
}
.motif-textarea:focus {
  border-color: var(--pink);
}
.motif-textarea::placeholder {
  color: #bdbdbd;
}

/* Submit */
.submit-btn {
  align-self: center;
  background: var(--pink);
  color: var(--white);
  font-size: 1rem;
  font-weight: 700;
  padding: 16px 48px;
  border-radius: 100px;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 20px rgba(233, 30, 140, 0.3);
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    opacity 0.2s;
}
.submit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(233, 30, 140, 0.4);
}
.submit-btn:active {
  transform: translateY(0);
  opacity: 0.9;
}

@media (max-width: 640px) {
  .order-header {
    padding: 60px 16px 28px;
  }
  .back-btn {
    top: 16px;
    left: 16px;
  }
  .order-section {
    padding: 24px 16px;
  }
}
</style>
