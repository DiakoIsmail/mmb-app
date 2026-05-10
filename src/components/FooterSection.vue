<script setup lang="ts">
const socials = [
  { label: 'Facebook', href: '#', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
  { label: 'LinkedIn', href: '#', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z' },
  { label: 'Twitter', href: '#', icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
  { label: 'Instagram', href: '#', icon: 'M21 2H3a1 1 0 00-1 1v18a1 1 0 001 1h18a1 1 0 001-1V3a1 1 0 00-1-1zM12 17a5 5 0 110-10 5 5 0 010 10zm5-9a1 1 0 110-2 1 1 0 010 2z' },
]
</script>

<template>
  <footer class="footer">
    <div class="footer__grid">
      <div class="footer__brand">
        <div class="footer__logo">
          <span class="footer__logo-icon">&#9829;</span>
          <span>CAKE</span>
        </div>
        <p class="footer__tagline">Canada's most delicious cupcakes for business meetings, birthdays, weddings.</p>
      </div>

      <div class="footer__col">
        <h4 class="footer__heading">Get In Touch</h4>
        <p>Eight Avenue 487, New York</p>
        <p>+38754392718</p>
        <p>letitear@gmail.com</p>
      </div>

      <div class="footer__col">
        <h4 class="footer__heading">Follow Us</h4>
        <div class="footer__socials">
          <a
            v-for="s in socials"
            :key="s.label"
            :href="s.href"
            :aria-label="s.label"
            class="footer__social-btn"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path :d="s.icon" />
            </svg>
          </a>
        </div>
      </div>
    </div>

    <div class="footer__bottom">
      <div class="footer__links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms &amp; Condition</a>
      </div>
      <p class="footer__copy">&copy; Copyright 2024 | Design by Mandy's Magic Bakery</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--dark);
  color: rgba(255,255,255,.75);
  padding: 56px 24px 24px;
}

.footer__grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 40px;
  max-width: 1100px;
  margin: 0 auto 40px;
}

.footer__logo {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--white);
  margin-bottom: 12px;
}
.footer__logo-icon { color: var(--pink); }

.footer__tagline {
  font-size: .88rem;
  line-height: 1.7;
  max-width: 240px;
}

.footer__heading {
  font-weight: 700;
  font-size: .95rem;
  color: var(--white);
  margin-bottom: 14px;
  letter-spacing: .04em;
}

.footer__col p {
  font-size: .88rem;
  margin-bottom: 6px;
}

.footer__socials {
  display: flex;
  gap: 10px;
}

.footer__social-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  transition: background .2s;
}
.footer__social-btn:hover { background: var(--pink); }

.footer__bottom {
  border-top: 1px solid rgba(255,255,255,.1);
  padding-top: 20px;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.footer__links {
  display: flex;
  gap: 20px;
}
.footer__links a {
  font-size: .85rem;
  color: rgba(255,255,255,.6);
  transition: color .2s;
}
.footer__links a:hover { color: var(--pink); }

.footer__copy { font-size: .82rem; color: rgba(255,255,255,.4); }

@media (max-width: 768px) {
  .footer__grid { grid-template-columns: 1fr; gap: 28px; }
  .footer__bottom { flex-direction: column; text-align: center; }
}
</style>
