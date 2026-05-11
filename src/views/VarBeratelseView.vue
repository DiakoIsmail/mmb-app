<script setup lang="ts">
import mandyImg from "../assets/images/manys/mandy_m_torta.jpg";
</script>

<template>
  <main class="story">
    <div class="story__hero">
      <img :src="mandyImg" alt="Amanda med tårta" class="story__hero-img" />
      <div class="story__hero-overlay">
        <h1 class="story__hero-title">Vår berättelse</h1>
      </div>
    </div>

    <div class="story__body">
      <div class="story__content">
        <p class="story__lead">
          Välkommen till Mandy's Magic Bakery! Jag är Amanda, och jag älskar att
          kombinera traditionella tekniker med modern innovation för att skapa
          visuellt imponerande och läcker konst.
        </p>

        <p>
          Varje tårta och bakelse jag gör är gjord från grunden med de finaste
          ingredienserna. Jag arbetar nära med dig för att fånga essensen av din
          speciella tillställning i varje detalj. Min passion ligger i
          detaljerna. Jag erbjuder allt från klassiska och eleganta designer
          till lekfulla och avantgardistiska skapelser.
        </p>

        <p>
          Har du en dröm om en tårta till din examen? Inga problem. Mitt mål är
          att överträffa dina förväntningar och lämna ett bestående intryck hos
          både dig och dina gäster.
        </p>

        <p>
          Jag är stolt över min förmåga att lyssna, anpassa och förverkliga dina
          mest kreativa idéer.
        </p>

        <p>
          Kontakta mig på Mandy's Magic Bakery och låt mig vara en del av din
          nästa stora händelse. Ditt firande förtjänar en tårta som inte bara är
          delikat och delikatess, utan en verklig konstform. Jag ser fram emot
          att skapa något extraordinärt tillsammans med dig!
        </p>

        <p class="story__signature">
          Vänliga hälsningar,<br />
          <span>Amanda</span>
        </p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.story {
  max-width: 1280px;
  margin: 0 auto;
}

.story__hero {
  position: relative;
  height: clamp(320px, 50vw, 560px);
  overflow: hidden;
}

.story__hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.story__hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(26, 26, 46, 0.2) 0%,
    rgba(26, 26, 46, 0.65) 100%
  );
  display: flex;
  align-items: flex-end;
  padding: 48px 56px;
}

.story__hero-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.5rem);
  color: #fff;
  line-height: 1.15;
}

.story__body {
  padding: 64px 24px 80px;
  display: flex;
  justify-content: center;
}

.story__content {
  max-width: 720px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.story__content p {
  font-size: 1.05rem;
  color: var(--dark);
  line-height: 1.85;
}

.story__lead {
  font-size: 1.2rem !important;
  font-weight: 600;
  color: var(--pink) !important;
  border-left: 4px solid var(--pink);
  padding-left: 20px;
}

.story__signature {
  margin-top: 16px;
  font-style: italic;
  color: var(--gray) !important;
  font-size: 1rem !important;
}

.story__signature span {
  display: block;
  margin-top: 6px;
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--dark);
  font-style: normal;
}

@media (max-width: 768px) {
  .story__hero-overlay {
    padding: 32px 24px;
  }

  .story__body {
    padding: 40px 16px 60px;
  }

  .story__lead {
    font-size: 1.05rem !important;
  }
}
</style>
