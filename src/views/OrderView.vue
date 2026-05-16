<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCart } from "../composables/useCart";

const route = useRoute();
const router = useRouter();
const { addToCart } = useCart();

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
const quantity = ref(1);
const inspirationFile = ref<File | null>(null);
const inspirationPreview = ref<string | null>(null);

const isCustomMotif = computed(() => selectedMotif.value === "eget");

function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  inspirationFile.value = file;
  inspirationPreview.value = URL.createObjectURL(file);
}

function removeImage() {
  if (inspirationPreview.value) URL.revokeObjectURL(inspirationPreview.value);
  inspirationFile.value = null;
  inspirationPreview.value = null;
}

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
  addToCart({
    id: `custom-${Date.now()}`,
    name: `Anpassad ${typeLabel.value}`,
    price: 0,
    image_url: inspirationPreview.value ?? "",
    qty: quantity.value,
    isCustom: true,
    customDetails: {
      type: typeLabel.value,
      flavors: selectedFlavors.value,
      text: cakeText.value,
      occasion: selectedOccasion.value,
      motif: isCustomMotif.value ? customMotif.value : selectedMotif.value,
    },
    inspirationImageFile: inspirationFile.value ?? undefined,
  });
  router.push("/");
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
      <!-- Antal -->
      <div class="order-section">
        <h2 class="section-label">Antal</h2>
        <p class="section-hint">Hur många {{ typeLabel.toLowerCase() }}ar vill du beställa?</p>
        <div class="qty-control">
          <button class="qty-control__btn" :disabled="quantity <= 1" @click="quantity--">−</button>
          <span class="qty-control__num">{{ quantity }}</span>
          <button class="qty-control__btn" @click="quantity++">+</button>
        </div>
      </div>

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

      <!-- Inspirationsbild -->
      <div class="order-section">
        <h2 class="section-label">Inspirationsbild</h2>
        <p class="section-hint">Valfritt — ladda upp en bild som inspiration för designen</p>

        <div v-if="!inspirationPreview" class="upload-zone" @click="($refs.fileInput as HTMLInputElement).click()">
          <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" class="upload-zone__icon">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <p class="upload-zone__text">Klicka för att ladda upp</p>
          <p class="upload-zone__hint">JPG, PNG, WEBP — max 10 MB</p>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="upload-hidden"
            @change="handleImageUpload"
          />
        </div>

        <div v-else class="upload-preview">
          <img :src="inspirationPreview" alt="Inspirationsbild" class="upload-preview__img" />
          <div class="upload-preview__info">
            <p class="upload-preview__name">{{ inspirationFile?.name }}</p>
            <button class="upload-preview__remove" @click="removeImage">Ta bort</button>
          </div>
        </div>
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

/* Antal stepper */
.qty-control {
  display: flex;
  align-items: center;
  gap: 0;
  background: #f9f0f5;
  border-radius: 100px;
  padding: 4px;
  width: fit-content;
}

.qty-control__btn {
  background: none;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.2rem;
  color: var(--dark);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}
.qty-control__btn:hover:not(:disabled) {
  background: var(--pink);
  color: var(--white);
}
.qty-control__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.qty-control__num {
  font-size: 1.1rem;
  font-weight: 700;
  min-width: 44px;
  text-align: center;
  color: var(--dark);
}

/* Upload */
.upload-zone {
  border: 2px dashed var(--pink-light);
  border-radius: 16px;
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.upload-zone:hover {
  border-color: var(--pink);
  background: var(--pink-bg);
}

.upload-zone__icon {
  color: var(--pink);
  opacity: 0.7;
}

.upload-zone__text {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--dark);
}

.upload-zone__hint {
  font-size: 0.78rem;
  color: var(--gray);
}

.upload-hidden {
  display: none;
}

.upload-preview {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 12px;
  border: 2px solid var(--pink-light);
  border-radius: 16px;
  background: var(--pink-bg);
}

.upload-preview__img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 10px;
  flex-shrink: 0;
}

.upload-preview__info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.upload-preview__name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload-preview__remove {
  background: none;
  color: var(--pink);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0;
  text-align: left;
  transition: opacity 0.2s;
}
.upload-preview__remove:hover {
  opacity: 0.7;
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
