<script setup lang="ts">
/**
 * Pedir cita (spec 06 §1). Es una SOLICITUD, no una reserva. Columna única sobre hueso, sin adornos: la
 * usabilidad manda. Lateral (≥ 1024) o bloque inferior con alternativas de contacto. Se indexa.
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
  <div>
    <PageHeader id="booking-title" title="Pide tu cita." eyebrow="Pedir cita">
      <ContentValue :value="subtitle" as="span" />
    </PageHeader>

    <section
      class="container-wide pb-(--space-section)"
      aria-label="Formulario de solicitud de cita"
      data-nav-theme="bone"
    >
      <div class="booking-layout">
        <div class="booking-main">
          <!-- v-html: el contenido de <noscript> no se puede hidratar como nodos (spec 10 §6, alternativa sin JS) -->
          <!-- eslint-disable-next-line vue/no-v-html -- contenido estático de site.ts -->
          <noscript v-html="noscriptHtml" />
          <BookingWizard />
        </div>

        <aside class="booking-aside" aria-labelledby="booking-alt">
          <h2 id="booking-alt" class="text-heading-s text-ink">¿Prefieres llamar?</h2>
          <p class="mt-2 text-text-secondary">Si lo prefieres, contacta con nosotros directamente.</p>
          <ul class="mt-5 grid gap-1" role="list">
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
  </div>
</template>

<style scoped>
.booking-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 3rem;
}
.booking-main {
  width: 100%;
  max-width: 760px;
}
.booking-aside {
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
}
.alt-link {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 44px;
  font-weight: 500;
  color: var(--color-ink);
}
.alt-link:hover {
  color: var(--color-primary-strong);
}
@media (min-width: 1024px) {
  .booking-layout {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: 1.5rem;
  }
  .booking-main {
    grid-column: 4 / span 6;
    max-width: none;
  }
  .booking-aside {
    grid-column: 10 / span 3;
    align-self: start;
    position: sticky;
    top: calc(var(--nav-h-compact) + 1.5rem);
    border-top: 0;
    border-left: 1px solid var(--color-border);
    padding: 0 0 0 1.5rem;
  }
}
</style>
