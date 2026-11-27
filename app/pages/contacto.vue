<script setup lang="ts">
/**
 * Contacto (spec 07) + solicitud de cita. Lectura en tres tiempos: cómo contactar (composición de cards de
 * distinto peso) → dónde estamos (mapa) → cómo pedir cita (formulario `#cita`, destino de todos los CTA).
 * Mismos datos que el footer y el schema (`site.ts`), en `pending()` hasta confirmarlos.
 */
import { site } from '~/data/site'

// El formulario ya está en la página: sin el CTA global de cierre
definePageMeta({ hideCta: true })

const clinic = useClinic()
const city = resolveValue(site.city)

usePageSeo({
  title: `Contacto y cita · Podología en ${city}`,
  description: `Teléfono, email, horario, cómo llegar y solicitud de cita en Valdepodo, clínica de podología en ${city}.`,
  path: '/contacto',
  type: 'ContactPage',
})

/* Datos de la propia clínica (site.ts), no entrada de usuario: seguro en v-html */
const noscriptHtml = `<p class="rounded-m border border-border bg-white p-6">Para enviar la solicitud online necesitas JavaScript. También puedes llamarnos al <a href="${clinic.phoneHref}" class="font-semibold underline">${clinic.phone}</a> o escribirnos a <a href="${clinic.mailHref}" class="font-semibold underline">${clinic.email}</a>.</p>`

/* Copiar al portapapeles con aviso para lectores de pantalla */
const copied = ref('')
async function copy(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = `${what} copiado al portapapeles`
  } catch {
    copied.value = `No se ha podido copiar ${what.toLowerCase()}`
  }
  window.setTimeout(() => (copied.value = ''), 3000)
}
</script>

<template>
  <div>
    <ClinicHero
      id="contact-title"
      title="Contacto"
      :photo="{ src: '/images/clinic/contacto.webp', alt: '' }"
      focus="50% 50%"
    />

    <!-- 1 · Cómo contactar -->
    <section
      class="container-wide py-[clamp(3.5rem,6vw,5.5rem)]"
      aria-label="Datos de contacto"
      data-nav-theme="bone"
    >
      <div class="bento">
        <!-- Ubicación: la pieza destacada -->
        <article v-reveal class="card card-place chapter-blue" aria-labelledby="c-place">
          <div>
            <p id="c-place" class="card-label"><BaseIcon name="map-pin" /> Dónde estamos</p>
            <address class="place-address not-italic">
              <ContentValue :value="site.address.street" /><br />
              <ContentValue :value="site.address.postalCode" />{{ ' ' }}
              <ContentValue :value="site.address.locality" />
            </address>
          </div>
          <div class="card-actions">
            <BaseButton variant="on-blue" :href="clinic.directions" target="_blank" rel="noopener" arrow>
              Cómo llegar<span class="sr-only"> (se abre en Google Maps)</span>
            </BaseButton>
            <button type="button" class="copy-btn" @click="copy(clinic.addressLine, 'Dirección')">
              <BaseIcon name="copy" class="size-4" /> Copiar dirección
            </button>
          </div>
        </article>

        <!-- Teléfono · email · redes: una sola fila mientras quepan -->
        <div class="contact-row">
          <article v-reveal="1" class="card card-phone" aria-labelledby="c-phone">
            <p id="c-phone" class="card-label"><BaseIcon name="phone" /> Teléfono</p>
            <a :href="clinic.phoneHref" class="card-value link-quiet">
              <ContentValue :value="site.phone" />
              <span class="sr-only"> (llamar)</span>
            </a>
            <div class="phone-actions">
              <button type="button" class="copy-btn" @click="copy(clinic.phone, 'Teléfono')">
                <BaseIcon name="copy" class="size-4" /> Copiar<span class="sr-only"> teléfono</span>
              </button>
              <a :href="clinic.whatsappHref" target="_blank" rel="noopener" class="copy-btn">
                WhatsApp<span class="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
            </div>
          </article>

          <!-- Email -->
          <article v-reveal="2" class="card card-mail" aria-labelledby="c-mail">
            <p id="c-mail" class="card-label"><BaseIcon name="mail" /> Email</p>
            <a :href="clinic.mailHref" class="card-value card-value--mail link-quiet">
              <ContentValue :value="site.email" />
            </a>
          </article>

          <article v-reveal="4" class="card card-social" aria-labelledby="c-social">
            <p id="c-social" class="card-label">Síguenos</p>
            <div class="social-list">
              <a :href="clinic.instagram.url" target="_blank" rel="noopener" class="social-icon">
                <BaseIcon name="instagram" />
                <span class="sr-only">Instagram (se abre en una pestaña nueva)</span>
              </a>
              <a :href="clinic.linkedin.url" target="_blank" rel="noopener" class="social-icon">
                <BaseIcon name="linkedin" />
                <span class="sr-only">LinkedIn (se abre en una pestaña nueva)</span>
              </a>
            </div>
          </article>
        </div>

        <!-- Horario -->
        <article v-reveal="3" class="card card-hours" aria-labelledby="c-hours">
          <p id="c-hours" class="card-label"><BaseIcon name="clock" /> Horario</p>
          <OpeningHours columns />
        </article>
      </div>
      <p class="sr-only" aria-live="polite">{{ copied }}</p>
      <p v-if="copied" class="toast" aria-hidden="true">{{ copied }}</p>
    </section>

    <!-- 2 · Formulario de cita + mapa. `#cita`: destino de todos los botones «Pedir cita» -->
    <section id="cita" class="cita chapter-bone-2" aria-labelledby="cita-title" data-nav-theme="bone">
      <div class="container-wide">
        <div class="cita-head">
          <SectionHeading
            id="cita-title"
            eyebrow="Pedir cita"
            :title="{ before: 'Cuéntanos qué necesitas.' }"
          />
          <p v-reveal="1" class="cita-intro">
            Rellena estos pasos y te contactaremos para confirmar día y hora. Es una solicitud, no una
            reserva.
          </p>
        </div>

        <div class="cita-grid">
          <div class="cita-form">
            <!-- v-html: el contenido de <noscript> no se puede hidratar como nodos (spec 10 §6) -->
            <!-- eslint-disable-next-line vue/no-v-html -- contenido estático de site.ts -->
            <noscript v-html="noscriptHtml" />
            <BookingWizard />
          </div>
          <MapFacade v-reveal class="cita-map" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ---------- Composición de cards ---------- */
.bento {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.75rem;
}
.card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  border-radius: var(--radius-l);
  background: var(--color-white);
  box-shadow: var(--shadow-soft);
  padding: 1.25rem 1.5rem;
}
.card-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.card-label :deep(.base-icon) {
  width: 1.1em;
  height: 1.1em;
  color: var(--color-primary-strong);
}
.card-value {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-heading-s);
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--color-ink);
}
.card-value--mail {
  font-size: clamp(1rem, 1.3vw, 1.25rem);
  line-height: 1.25;
  overflow-wrap: anywhere;
}
.link-quiet {
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 0.25em;
  transition:
    text-decoration-color var(--dur-fast),
    color var(--dur-fast);
}
.link-quiet:hover {
  color: var(--color-primary-strong);
  text-decoration-color: currentColor;
}

/* Ubicación: capítulo azul, la pieza de mayor peso */
.card-place {
  justify-content: space-between;
  gap: 2rem;
  padding: clamp(1.5rem, 3vw, 2.25rem);
  box-shadow: none;
  background: var(--color-primary);
  color: var(--color-ink);
}
.card-place .card-label,
.card-place .card-label :deep(.base-icon) {
  color: rgb(6 26 44 / 0.75);
}
.place-address {
  margin-top: 1.25rem;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-display-s, var(--text-heading-l, 2rem));
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--color-bone);
}
.card-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1.5rem;
}
.card-place .copy-btn {
  color: var(--color-ice-blue);
}
.card-place .copy-btn:hover {
  color: var(--color-bone);
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  align-self: flex-start;
  min-height: 32px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
}
.copy-btn:hover {
  color: var(--color-primary-strong);
}

/* Fila de contacto rápido: las tres cards comparten fila y solo saltan de línea si no caben */
.contact-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  grid-column: 1 / -1;
}
.contact-row > .card {
  flex: 1 1 11rem;
  min-width: 0;
}
.contact-row > .card-mail {
  flex-grow: 2;
  flex-basis: 13rem;
}
.contact-row > .card-social {
  flex: 0 1 auto;
}

/* Redes: card con más presencia */
.card-social {
  justify-content: space-between;
  background: var(--color-white);
}
.social-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.social-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  background: var(--color-white);
  color: var(--color-primary-strong);
  transition:
    background var(--dur-fast),
    color var(--dur-fast);
}
.social-icon:hover {
  background: var(--color-primary);
  color: var(--color-ink);
}
.social-icon :deep(.base-icon) {
  width: 1.4rem;
  height: 1.4rem;
}
.phone-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0 1.25rem;
}
.card-phone,
.card-mail {
  padding: 1rem 1.25rem;
  gap: 0.4rem;
}
.card-phone .card-value {
  font-size: clamp(1.25rem, 1.8vw, 1.5rem);
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 1.5rem;
  z-index: 30;
  transform: translateX(-50%);
  border-radius: var(--radius-m);
  background: var(--color-ink);
  color: var(--color-bone);
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

@media (min-width: 640px) {
  .bento {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .card-place,
  .card-hours {
    grid-column: 1 / -1;
  }
}
@media (min-width: 1024px) {
  .bento {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 1rem;
  }
  /* Izquierda: ubicación (alta). Derecha: teléfono + email · redes · horario */
  .card-place {
    grid-column: 1 / span 5;
    grid-row: 1 / span 2;
  }
  .contact-row {
    grid-column: 6 / span 7;
    grid-row: 1;
    gap: 1rem;
  }
  .card-hours {
    grid-column: 6 / span 7;
    grid-row: 2;
  }
}

/* ---------- Cita + mapa ---------- */
.cita {
  --cita-pad: clamp(3.5rem, 6vw, 5.5rem);
  /* Al llegar por el ancla el rótulo queda a 2rem bajo la navbar: se descuenta el padding propio. El hueco
     de la navbar ya lo pone `scroll-padding-top` en <html>; aquí solo se suma 1rem */
  scroll-margin-top: calc(1rem - var(--cita-pad));
  padding-block: var(--cita-pad);
}
.cita-head {
  display: grid;
  gap: 1rem;
  margin-bottom: clamp(2rem, 4vw, 3.5rem);
}
.cita-intro {
  max-width: 44ch;
  color: var(--color-text-secondary);
}
.cita-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.5rem;
}
@media (min-width: 1024px) {
  .cita-head {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: end;
    gap: 1.5rem;
  }
  .cita-intro {
    justify-self: end;
  }
  .cita-grid {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    gap: 1.5rem;
    align-items: stretch;
  }
  .cita-map {
    position: sticky;
    top: calc(var(--nav-h-compact) + 1.5rem);
    align-self: start;
    height: min(40rem, calc(100vh - var(--nav-h-compact) - 3rem));
  }
}
</style>
