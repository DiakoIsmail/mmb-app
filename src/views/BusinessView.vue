<script setup lang="ts">
import { ref } from "vue";
import { supabase } from "@/lib/supabase";

const form = ref({ company: "", name: "", email: "", phone: "", message: "" });
const submitted = ref(false);
const sending = ref(false);
const error = ref("");

async function send() {
  const { company, name, email } = form.value;
  if (!company.trim() || !name.trim() || !email.trim()) return;

  sending.value = true;
  error.value = "";

  const { error: fnError } = await supabase.functions.invoke(
    "send-business-inquiry",
    {
      body: {
        company: form.value.company,
        name: form.value.name,
        email: form.value.email,
        phone: form.value.phone,
        message: form.value.message,
      },
    },
  );

  sending.value = false;

  if (fnError) {
    error.value = "Något gick fel. Försök igen eller kontakta oss direkt.";
    return;
  }

  submitted.value = true;
  form.value = { company: "", name: "", email: "", phone: "", message: "" };
  setTimeout(() => (submitted.value = false), 6000);
}
</script>

<template>
  <main class="biz-page">
    <!-- Hero -->
    <section class="biz-hero">
      <p class="biz-hero__label">Företag &amp; Grossist</p>
      <h1 class="biz-hero__title">Beställ till din verksamhet</h1>
      <p class="biz-hero__sub">
        Vi samarbetar med kaféer, butiker, restauranger och eventbolag som vill
        erbjuda sina kunder handgjorda bakelser av högsta kvalitet.
      </p>
    </section>

    <!-- Erbjudande -->
    <section class="biz-offers">
      <div class="biz-offers__grid">
        <div class="biz-offer-card">
          <div class="biz-offer-card__icon">
            <svg
              width="28"
              height="28"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <h3>Grossistleverans</h3>
          <p>
            Regelbunden leverans av färska produkter direkt till din verksamhet
            ,dagligen, veckovis eller efter ditt schema.
          </p>
        </div>
        <div class="biz-offer-card">
          <div class="biz-offer-card__icon">
            <svg
              width="28"
              height="28"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <h3>Skräddarsytt sortiment</h3>
          <p>
            Vi anpassar smaksättning, förpackning och etikett efter din butiks
            profil och kundernas preferenser.
          </p>
        </div>
        <div class="biz-offer-card">
          <div class="biz-offer-card__icon">
            <svg
              width="28"
              height="28"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 00-4 0v2M12 12v4M10 14h4" />
            </svg>
          </div>
          <h3>Eventbeställningar</h3>
          <p>
            Planerar du ett företagsevent, mässa eller konferens? Vi tar fram
            ett komplett dessertbord anpassat för ditt event.
          </p>
        </div>
      </div>
    </section>

    <!-- Info + Kontaktformulär -->
    <section class="biz-main">
      <div class="biz-main__grid">
        <!-- Kontaktuppgifter -->
        <div class="biz-info">
          <h2 class="biz-info__title">Kontakta oss direkt</h2>
          <p class="biz-info__sub">
            Skicka ett meddelande eller ring oss så återkommer vi inom 24
            timmar.
          </p>

          <ul class="biz-contact-list">
            <li class="biz-contact-item">
              <span class="biz-contact-item__icon">
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
                  <path
                    d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                  />
                </svg>
              </span>
              <div>
                <span class="biz-contact-item__label">Telefon</span>
                <a href="tel:+46112354" class="biz-contact-item__value"
                  >+46 112 23 54</a
                >
              </div>
            </li>
            <li class="biz-contact-item">
              <span class="biz-contact-item__icon">
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
                  <path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                  />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <div>
                <span class="biz-contact-item__label">E-post</span>
                <a
                  href="mailto:foretag@mandysmagicbakery.se"
                  class="biz-contact-item__value"
                  >mandys.magic.bakery@hotmail.com</a
                >
              </div>
            </li>
            <li class="biz-contact-item">
              <span class="biz-contact-item__icon">
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
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <div>
                <span class="biz-contact-item__label">Adress</span>
                <span class="biz-contact-item__value"
                  >Låtsas adressen 23, New York</span
                >
              </div>
            </li>
            <li class="biz-contact-item">
              <span class="biz-contact-item__icon">
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
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              <div>
                <span class="biz-contact-item__label">Svarstid</span>
                <span class="biz-contact-item__value"
                  >Inom 24 timmar på vardagar</span
                >
              </div>
            </li>
          </ul>

          <div class="biz-min-order">
            <p class="biz-min-order__title">Minimibeställning</p>
            <p class="biz-min-order__text">
              Vi tar emot företagsbeställningar från 10 enheter per order.
              Kontakta oss för prislistor och volymrabatter.
            </p>
          </div>
        </div>

        <!-- Formulär -->
        <div class="biz-form-wrap">
          <h2 class="biz-form__title">Skicka en förfrågan</h2>
          <form class="biz-form" @submit.prevent="send">
            <div class="biz-form__row">
              <div class="biz-form__field">
                <label>Företagsnamn *</label>
                <input
                  v-model="form.company"
                  type="text"
                  placeholder="Ditt AB"
                  required
                />
              </div>
              <div class="biz-form__field">
                <label>Kontaktperson *</label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="Förnamn Efternamn"
                  required
                />
              </div>
            </div>
            <div class="biz-form__row">
              <div class="biz-form__field">
                <label>E-post *</label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="din@email.se"
                  required
                />
              </div>
              <div class="biz-form__field">
                <label>Telefon</label>
                <input
                  v-model="form.phone"
                  type="tel"
                  placeholder="+46 70 000 00 00"
                />
              </div>
            </div>
            <div class="biz-form__field">
              <label>Beskriv din beställning</label>
              <textarea
                v-model="form.message"
                rows="4"
                placeholder="Vilka produkter är du intresserad av, hur ofta vill du beställa, antal enheter..."
              ></textarea>
            </div>
            <button type="submit" class="btn btn--send" :disabled="sending">
              {{ sending ? "Skickar…" : "Skicka förfrågan" }}
            </button>
            <p v-if="submitted" class="biz-form__success">
              Tack! Vi återkommer till dig inom 24 timmar.
            </p>
            <p v-if="error" class="biz-form__error">{{ error }}</p>
          </form>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.biz-page {
  background: var(--white);
}

/* Hero */
.biz-hero {
  background: linear-gradient(135deg, var(--dark) 0%, #2a1a2e 100%);
  text-align: center;
  padding: 100px 24px 72px;
  position: relative;
  overflow: hidden;
}
.biz-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 60% 50%,
    rgba(233, 30, 140, 0.18) 0%,
    transparent 65%
  );
  pointer-events: none;
}
.biz-hero__label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--pink);
  margin-bottom: 16px;
}
.biz-hero__title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.2rem);
  color: var(--white);
  margin-bottom: 20px;
  line-height: 1.15;
}
.biz-hero__sub {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.65);
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.8;
}

/* Offer cards */
.biz-offers {
  padding: 64px 24px;
  background: #fdf7fb;
}
.biz-offers__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
}
.biz-offer-card {
  background: var(--white);
  border-radius: 16px;
  padding: 32px 28px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.05);
  transition:
    box-shadow 0.2s,
    transform 0.2s;
}
.biz-offer-card:hover {
  box-shadow: 0 8px 32px rgba(233, 30, 140, 0.12);
  transform: translateY(-3px);
}
.biz-offer-card__icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #fce4f0, #fdf0e6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--pink);
  margin-bottom: 20px;
}
.biz-offer-card h3 {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--dark);
  margin-bottom: 10px;
}
.biz-offer-card p {
  font-size: 0.88rem;
  color: var(--gray);
  line-height: 1.75;
}

/* Main content */
.biz-main {
  padding: 64px 24px 80px;
}
.biz-main__grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 60px;
  max-width: 1100px;
  margin: 0 auto;
  align-items: start;
}

/* Info side */
.biz-info__title {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 2.5vw, 2rem);
  color: var(--dark);
  margin-bottom: 10px;
}
.biz-info__sub {
  font-size: 0.9rem;
  color: var(--gray);
  margin-bottom: 36px;
  line-height: 1.7;
}
.biz-contact-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 36px;
}
.biz-contact-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.biz-contact-item__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #fce4f0, #fdf0e6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--pink);
  flex-shrink: 0;
}
.biz-contact-item__label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gray);
  margin-bottom: 2px;
}
.biz-contact-item__value {
  font-size: 0.92rem;
  color: var(--dark);
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}
a.biz-contact-item__value:hover {
  color: var(--pink);
}

.biz-min-order {
  background: linear-gradient(135deg, #fce4f0 0%, #fdf0e6 100%);
  border-radius: 14px;
  padding: 20px 24px;
}
.biz-min-order__title {
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--dark);
  margin-bottom: 6px;
}
.biz-min-order__text {
  font-size: 0.85rem;
  color: var(--gray);
  line-height: 1.65;
}

/* Form side */
.biz-form-wrap {
  background: var(--white);
  border: 1px solid #f0dcea;
  border-radius: 20px;
  padding: 40px 36px;
  box-shadow: 0 4px 32px rgba(233, 30, 140, 0.07);
}
.biz-form__title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--dark);
  margin-bottom: 28px;
}
.biz-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.biz-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.biz-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.biz-form__field label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--dark);
  letter-spacing: 0.03em;
}
.biz-form__field input,
.biz-form__field textarea {
  padding: 12px 16px;
  border: 1px solid #f0dcea;
  border-radius: 10px;
  font-size: 0.9rem;
  font-family: var(--font-body);
  color: var(--dark);
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  resize: vertical;
  background: #fdf7fb;
}
.biz-form__field input:focus,
.biz-form__field textarea:focus {
  border-color: var(--pink);
  box-shadow: 0 0 0 3px rgba(233, 30, 140, 0.08);
  background: var(--white);
}

.btn--send {
  background: var(--pink);
  color: var(--white);
  padding: 14px 32px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  transition:
    background 0.2s,
    transform 0.2s;
  align-self: flex-start;
}
.btn--send:hover {
  background: #c0166f;
  transform: translateY(-2px);
}

.biz-form__success {
  color: var(--pink);
  font-weight: 600;
  font-size: 0.88rem;
  animation: fadeIn 0.3s ease;
}
.biz-form__error {
  color: #c0392b;
  font-weight: 600;
  font-size: 0.88rem;
  animation: fadeIn 0.3s ease;
}
.btn--send:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 900px) {
  .biz-offers__grid {
    grid-template-columns: 1fr;
  }
  .biz-main__grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .biz-form-wrap {
    padding: 28px 20px;
  }
}
@media (max-width: 560px) {
  .biz-form__row {
    grid-template-columns: 1fr;
  }
}
</style>
