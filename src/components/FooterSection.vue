<script setup lang="ts">
import mandysLogo from "@/assets/logos/mandys-logo.jpeg";
const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/mandys.magic.bakery/?locale=sv_SE",
    icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
  },
  // {
  //   label: "LinkedIn",
  //   href: "#",
  //   icon: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z",
  // },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@mandysmagicbakery",
    icon: "M9 12a4 4 0 104 4V4a5 5 0 005 5",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/mandys.magic.bakery/",
    icon: "M16 3H8a5 5 0 00-5 5v8a5 5 0 005 5h8a5 5 0 005-5V8a5 5 0 00-5-5zM12 15a3 3 0 110-6 3 3 0 010 6z",
  },
];
</script>

<template>
  <footer class="footer">
    <div class="footer__grid">
      <div class="footer__brand">
        <img
          :src="mandysLogo"
          alt="Mandy's Magic Bakery"
          class="footer__logo"
        />
        <p class="footer__tagline">Sveriges finaste och godaste bakelser</p>
      </div>

      <div class="footer__col">
        <h4 class="footer__heading">Get In Touch</h4>
        <p>Låtsas adressen 23, New York</p>
        <p>+46 112 23 54</p>
        <p>mandys.magic.bakery@hotmail.com</p>
      </div>

      <div class="footer__col">
        <h4 class="footer__heading">Följ oss</h4>
        <div class="footer__socials">
          <a
            v-for="s in socials"
            :key="s.label"
            :href="s.href"
            :aria-label="s.label"
            class="footer__social-btn"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
            >
              <path :d="s.icon" />
            </svg>
          </a>
        </div>
      </div>
    </div>

    <div class="footer__bottom">
      <div class="footer__links"></div>
      <p class="footer__copy">
        &copy; Copyright 2026 | Design by Mandy's Magic Bakery
      </p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--dark);
  color: rgba(255, 255, 255, 0.75);
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
  width: 160px;
  height: auto;
  margin-bottom: 14px;
  border-radius: 100px;
  display: block;
}

.footer__tagline {
  font-size: 0.88rem;
  line-height: 1.7;
  max-width: 240px;
}

.footer__heading {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--white);
  margin-bottom: 14px;
  letter-spacing: 0.04em;
}

.footer__col p {
  font-size: 0.88rem;
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
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  transition: background 0.2s;
}
.footer__social-btn:hover {
  background: var(--pink);
}

.footer__bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.2s;
}
.footer__links a:hover {
  color: var(--pink);
}

.footer__copy {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.4);
}

@media (max-width: 768px) {
  .footer__grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }
  .footer__bottom {
    flex-direction: column;
    text-align: center;
  }
}
</style>
