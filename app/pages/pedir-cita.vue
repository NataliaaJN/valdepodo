<script setup lang="ts">
/**
 * Pedir cita (spec 06 §1). Es una SOLICITUD, no una reserva. Diseño limpio y centrado (≤ 720 px), fondo con
 * atmósfera muy suave, sin elementos flotantes. Lateral (≥ 1024) o bloque inferior con alternativas de
 * contacto. Se indexa (búsquedas "pedir cita podólogo {ciudad}").
 */
import { pending, resolveValue } from '#shared/utils/pending'
import { site } from '~/data/site'

const clinic = useClinic()
const city = resolveValue(site.city)

usePageSeo({
  title: 'Pedir cita',
  description: `Solicita tu cita en Valdepodo, clínica de podología en ${city}. Rellena unos pasos y te contactaremos para confirmar día y hora.`,
  path: '/pedir-cita',
})

/* Datos de la propia clínica (site.ts), no entrada de usuario: seguro en v-html */
const noscriptHtml = `<p class="rounded-m border border-border bg-white p-6">Para enviar la solicitud online necesitas JavaScript. También puedes llamarnos al <a href="${clinic.phoneHref}" class="font-semibold underline">${clinic.phone}</a> o escribirnos a <a href="${clinic.mailHref}" class="font-semibold underline">${clinic.email}</a>.</p>`

const subtitle = pending(
  'Rellena estos pasos y te contactaremos para confirmar día y hora.',
  'Subtítulo de pedir cita (spec 06 §1): validar',
)
</script>

<template>
  <section class="section-clip relative isolate pb-(--space-section)" aria-labelledby="booking-title">
    <div class="booking-atmosphere pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
    <div class="container-site booking-layout pt-12 lg:pt-16">
      <header class="booking-header">
        <p class="eyebrow text-primary-strong">Pedir cita</p>
        <h1 id="booking-title" class="mt-4 font-display text-display-l text-deep-blue">
          Pide tu <em class="text-primary">cita</em>.
        </h1>
        <ContentValue :value="subtitle" as="p" class="mt-4 max-w-[46ch] text-body-l text-text-secondary" />
      </header>

      <div class="booking-main">
        <!-- v-html: el contenido de <noscript> no se puede hidratar como nodos (spec 10 §6, alternativa sin JS) -->
        <!-- eslint-disable-next-line vue/no-v-html -- contenido estático de site.ts -->
        <noscript v-html="noscriptHtml" />
        <BookingWizard />
      </div>

      <aside class="booking-aside" aria-labelledby="booking-alt">
        <h2 id="booking-alt" class="text-heading-s font-semibold text-deep-blue">¿Prefieres llamar?</h2>
        <p class="mt-2 text-text-secondary">Si lo prefieres, contacta con nosotros directamente.</p>
        <ul class="mt-5 grid gap-4" role="list">
          <li>
            <a :href="clinic.phoneHref" class="alt-link">
              <BaseIcon name="phone" class="text-primary" />
              <ContentValue :value="site.phone" />
            </a>
          </li>
          <li>
            <a :href="clinic.mailHref" class="alt-link break-all">
              <BaseIcon name="mail" class="text-primary" />
              <ContentValue :value="site.email" />
            </a>
          </li>
        </ul>
        <OpeningHours class="mt-6 text-sm" />
      </aside>
    </div>
  </section>
</template>

<style scoped>
.booking-atmosphere {
  background: radial-gradient(50% 40% at 80% 10%, rgb(185 229 243 / 0.45), transparent 70%);
}
.booking-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2.5rem;
}
.booking-main,
.booking-header {
  width: 100%;
  max-width: 720px;
}
.booking-aside {
  border-radius: var(--radius-l);
  border: 1px solid var(--color-border);
  background: rgb(255 255 255 / 0.7);
  padding: 1.5rem;
}
.alt-link {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 44px;
  font-weight: 600;
  color: var(--color-deep-blue);
}
.alt-link:hover {
  color: var(--color-primary-strong);
}
@media (min-width: 1024px) {
  .booking-layout {
    grid-template-columns: minmax(0, 720px) minmax(0, 320px);
    justify-content: center;
    column-gap: 3rem;
  }
  .booking-header {
    grid-column: 1;
  }
  .booking-main {
    grid-column: 1;
  }
  .booking-aside {
    grid-column: 2;
    grid-row: 2;
    align-self: start;
    position: sticky;
    top: calc(var(--nav-h-compact) + 1.5rem);
  }
}
</style>
