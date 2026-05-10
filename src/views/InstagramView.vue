<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Post {
  id: string
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  mediaUrl: string
  thumbnailUrl?: string
  permalink: string
  caption?: string
  timestamp: string
}

const FEED_ID = import.meta.env.VITE_BEHOLD_FEED_ID as string | undefined

const posts = ref<Post[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function fetchFeed() {
  if (!FEED_ID) {
    error.value = 'no-feed-id'
    loading.value = false
    return
  }
  try {
    const res = await fetch(`https://feeds.behold.so/${FEED_ID}`)
    if (!res.ok) throw new Error('bad response')
    posts.value = await res.json()
  } catch {
    error.value = 'fetch-error'
  } finally {
    loading.value = false
  }
}

onMounted(fetchFeed)
</script>

<template>
  <main class="ig-page">
    <div class="ig-page__header">
      <div class="ig-page__header-left">
        <svg class="ig-page__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
        <div>
          <h1 class="ig-page__title">@mandys.magic.bakery</h1>
          <p class="ig-page__subtitle">Daglig inspiration direkt från vårt kök</p>
        </div>
      </div>
      <a
        href="https://www.instagram.com/mandys.magic.bakery/"
        target="_blank"
        rel="noopener noreferrer"
        class="ig-page__follow-btn"
      >
        Följ oss
      </a>
    </div>

    <div v-if="loading" class="ig-grid" aria-busy="true">
      <div v-for="i in 12" :key="i" class="ig-card ig-card--skeleton" />
    </div>

    <div v-else-if="error === 'no-feed-id'" class="ig-page__notice">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h2>Flödet är inte konfigurerat ännu</h2>
      <p>
        Skapa ett gratis konto på <strong>behold.so</strong>, anslut
        Instagram-kontot <strong>@mandys.magic.bakery</strong> och lägg sedan
        till ditt feed-ID i <code>.env</code>:
      </p>
      <pre class="ig-page__code">VITE_BEHOLD_FEED_ID=ditt-feed-id-här</pre>
      <a
        href="https://www.instagram.com/mandys.magic.bakery/"
        target="_blank"
        rel="noopener noreferrer"
        class="ig-page__follow-btn"
      >
        Besök Instagram i mellantiden →
      </a>
    </div>

    <div v-else-if="error" class="ig-page__notice ig-page__notice--error">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h2>Kunde inte ladda Instagram-flödet</h2>
      <p>Försök igen om en stund eller besök oss direkt på Instagram.</p>
      <a
        href="https://www.instagram.com/mandys.magic.bakery/"
        target="_blank"
        rel="noopener noreferrer"
        class="ig-page__follow-btn"
      >
        Öppna Instagram →
      </a>
    </div>

    <template v-else>
      <div class="ig-grid">
        <a
          v-for="post in posts"
          :key="post.id"
          :href="post.permalink"
          target="_blank"
          rel="noopener noreferrer"
          class="ig-card"
        >
          <img
            :src="post.thumbnailUrl ?? post.mediaUrl"
            :alt="post.caption ? post.caption.slice(0, 80) : 'Instagram-inlägg'"
            class="ig-card__img"
            loading="lazy"
          />
          <div class="ig-card__overlay">
            <svg v-if="post.mediaType === 'VIDEO'" class="ig-card__type-icon" viewBox="0 0 24 24" fill="currentColor" aria-label="Video">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <svg v-else-if="post.mediaType === 'CAROUSEL_ALBUM'" class="ig-card__type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-label="Karusell">
              <rect x="2" y="7" width="15" height="15" rx="2"/>
              <path d="M17 5h2a2 2 0 012 2v12"/>
            </svg>
            <p v-if="post.caption" class="ig-card__caption">
              {{ post.caption.slice(0, 120) }}{{ post.caption.length > 120 ? '…' : '' }}
            </p>
          </div>
        </a>
      </div>

      <div class="ig-page__cta">
        <a
          href="https://www.instagram.com/mandys.magic.bakery/"
          target="_blank"
          rel="noopener noreferrer"
          class="ig-page__cta-btn"
        >
          Se alla inlägg på Instagram →
        </a>
      </div>
    </template>
  </main>
</template>

<style scoped>
.ig-page {
  padding: 60px 24px 80px;
  max-width: 1100px;
  margin: 0 auto;
}

.ig-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 48px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0e0eb;
}

.ig-page__header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ig-page__icon {
  width: 48px;
  height: 48px;
  color: var(--pink);
  flex-shrink: 0;
}

.ig-page__title {
  font-family: var(--font-display);
  font-size: 1.6rem;
  color: var(--dark);
  margin-bottom: 4px;
}

.ig-page__subtitle {
  font-size: 0.9rem;
  color: var(--gray);
}

.ig-page__follow-btn {
  display: inline-block;
  padding: 10px 24px;
  background: var(--pink);
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 8px;
  transition: opacity 0.2s;
  white-space: nowrap;
}
.ig-page__follow-btn:hover { opacity: 0.85; }

.ig-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

.ig-card {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f5e8f0;
  display: block;
}

.ig-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
  display: block;
}

.ig-card:hover .ig-card__img {
  transform: scale(1.05);
}

.ig-card__overlay {
  position: absolute;
  inset: 0;
  background: rgba(233, 30, 140, 0.75);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.ig-card:hover .ig-card__overlay {
  opacity: 1;
}

.ig-card__type-icon {
  width: 28px;
  height: 28px;
  color: #fff;
  flex-shrink: 0;
}

.ig-card__caption {
  color: #fff;
  font-size: 0.82rem;
  line-height: 1.5;
  text-align: center;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

.ig-card--skeleton {
  background: linear-gradient(90deg, #f5e0ef 25%, #fce8f4 50%, #f5e0ef 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.ig-page__notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  padding: 64px 24px;
  border: 2px dashed #f0d0e5;
  border-radius: 16px;
  color: var(--dark);
}
.ig-page__notice svg { color: var(--pink); }
.ig-page__notice h2 { font-family: var(--font-display); font-size: 1.4rem; }
.ig-page__notice p { color: var(--gray); max-width: 480px; line-height: 1.7; }
.ig-page__notice code { background: #fce8f4; padding: 2px 6px; border-radius: 4px; font-size: 0.85rem; }
.ig-page__notice--error { border-color: #f5c0c0; }
.ig-page__notice--error svg { color: #e05050; }

.ig-page__code {
  background: #1a1a2e;
  color: #f0c0de;
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 0.85rem;
  letter-spacing: 0.02em;
  max-width: 100%;
  overflow-x: auto;
}

.ig-page__cta {
  display: flex;
  justify-content: center;
  margin-top: 48px;
}

.ig-page__cta-btn {
  display: inline-block;
  padding: 14px 32px;
  border: 2px solid var(--pink);
  color: var(--pink);
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 8px;
  transition: all 0.2s;
}
.ig-page__cta-btn:hover {
  background: var(--pink);
  color: #fff;
}

@media (max-width: 768px) {
  .ig-page { padding: 40px 16px 60px; }
  .ig-page__title { font-size: 1.2rem; }
  .ig-page__icon { width: 36px; height: 36px; }
  .ig-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .ig-grid { grid-template-columns: repeat(2, 1fr); gap: 2px; }
  .ig-page__header { flex-direction: column; align-items: flex-start; }
}
</style>
