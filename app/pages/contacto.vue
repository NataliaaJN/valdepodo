<script setup lang="ts">
/**
 * Contacto (spec 07): bloques de información (dirección, teléfono, email, Instagram, horario) y mapa con
 * fachada. Mismos datos que el footer y el schema (`site.ts`), en `pending()` hasta confirmarlos.
 * Escritorio: información 5 col + mapa 7 col · tablet: información 2×2 + mapa debajo · móvil: apilado.
 */
import { resolveValue } from '#shared/utils/pending'
import { site } from '~/data/site'

const clinic = useClinic()
const city = resolveValue(site.city)

usePageSeo({
  title: `Contacto · Podología en ${city}`,
  description: `Dirección, teléfono, horario y cómo llegar a Valdepodo, clínica de podología en ${city}.`,
  path: '/contacto',
})

/* Copiar al portapapeles con aviso para lectores de pantalla (spec 07 §2) */
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
    <section class="section-clip relative isolate" aria-labelledby="contact-title">
      <div
        class="pointer-events-none absolute inset-0 -z-10 bg-(image:--grad-atmosphere)"
        aria-hidden="true"
      />
      <div class="container-site pt-12 pb-10 lg:pt-20">
        <p class="eyebrow text-primary-strong">Contacto</p>
        <h1 id="contact-title" class="mt-4 max-w-[16ch] font-display text-display-l text-deep-blue">
          Estamos aquí para <em class="text-primary">ayudarte</em>.
        </h1>
      </div>
    </section>

    <section class="container-site pb-(--space-section)" aria-label="Datos de contacto y mapa">
      <div class="contact-grid">
        <div class="info-grid">
          <!-- Dirección -->
          <div v-reveal class="info-block">
            <BaseIcon name="map-pin" class="info-icon" />
            <h2 class="eyebrow text-primary-strong">Dirección</h2>
            <address class="mt-2 text-heading-s font-semibold text-deep-blue not-italic">
              <ContentValue :value="site.address.street" /><br />
              <ContentValue :value="site.address.postalCode" />{{ ' ' }}
              <ContentValue :value="site.address.locality" />
              <span class="block text-base font-normal text-text-secondary"
                ><ContentValue :value="site.address.region"
              /></span>
            </address>
            <div class="info-actions">
              <BaseButton variant="ghost" :href="clinic.directions" target="_blank" rel="noopener">
                Cómo llegar<span class="sr-only"> (se abre en Google Maps)</span>
              </BaseButton>
              <button type="button" class="copy-btn" @click="copy(clinic.addressLine, 'Dirección')">
                <BaseIcon name="copy" class="size-4" /> Copiar
                <span class="sr-only">dirección</span>
              </button>
            </div>
          </div>

          <!-- Teléfono -->
          <div v-reveal="1" class="info-block">
            <BaseIcon name="phone" class="info-icon" />
            <h2 class="eyebrow text-primary-strong">Teléfono</h2>
            <p class="mt-2 text-heading-s font-semibold text-deep-blue">
              <ContentValue :value="site.phone" />
            </p>
            <div class="info-actions">
              <BaseButton :href="clinic.phoneHref" size="sm" class="phone-cta">Llamar</BaseButton>
              <button type="button" class="copy-btn" @click="copy(clinic.phone, 'Teléfono')">
                <BaseIcon name="copy" class="size-4" /> Copiar
                <span class="sr-only">teléfono</span>
              </button>
            </div>
          </div>

          <!-- Email -->
          <div v-reveal="2" class="info-block">
            <BaseIcon name="mail" class="info-icon" />
            <h2 class="eyebrow text-primary-strong">Email</h2>
            <p class="mt-2 text-heading-s font-semibold break-all text-deep-blue">
              <ContentValue :value="site.email" />
            </p>
            <div class="info-actions">
              <BaseButton variant="ghost" :href="clinic.mailHref">Escribir un correo</BaseButton>
            </div>
          </div>

          <!-- Instagram -->
          <div v-reveal="3" class="info-block">
            <BaseIcon name="instagram" class="info-icon" />
            <h2 class="eyebrow text-primary-strong">Instagram</h2>
            <p class="mt-2 text-heading-s font-semibold text-deep-blue">
              <ContentValue v-slot="{ value }" :value="site.instagram">{{ value.handle }}</ContentValue>
            </p>
            <div class="info-actions">
              <BaseButton variant="ghost" :href="clinic.instagram.url" target="_blank" rel="noopener">
                Ver perfil<span class="sr-only"> de Instagram (se abre en una pestaña nueva)</span>
              </BaseButton>
            </div>
          </div>

          <!-- Horario -->
          <div v-reveal="4" class="info-block info-hours">
            <BaseIcon name="clock" class="info-icon" />
            <h2 class="eyebrow text-primary-strong">Horario</h2>
            <OpeningHours class="mt-2" />
          </div>
        </div>

        <MapFacade v-reveal class="map" />
      </div>
      <p class="sr-only" aria-live="polite">{{ copied }}</p>
      <p v-if="copied" class="toast glass" aria-hidden="true">{{ copied }}</p>
    </section>

    <CtaBlock
      :title="{ before: '¿Prefieres pedir tu cita ', accent: 'online', after: '?' }"
      :cta="{ label: 'Pedir cita', to: '/pedir-cita' }"
      :secondary="{ label: 'Llamar', href: clinic.phoneHref }"
    />
  </div>
</template>

<style scoped>
.contact-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2.5rem;
}
.info-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}
.info-block {
  position: relative;
  border-radius: var(--radius-m);
  border: 1px solid var(--color-border);
  background: var(--color-white);
  padding: 1.5rem 1.5rem 1.25rem 4.25rem;
}
.info-icon {
  position: absolute;
  left: 1.5rem;
  top: 1.5rem;
  width: 1.75rem;
  height: 1.75rem;
  color: var(--color-primary);
}
.info-actions {
  margin-top: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.25rem;
}
.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
}
.copy-btn:hover {
  color: var(--color-primary-strong);
}
.toast {
  position: fixed;
  left: 50%;
  bottom: 1.5rem;
  z-index: 30;
  transform: translateX(-50%);
  border-radius: var(--radius-pill);
  padding: 0.6rem 1.2rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-deep-blue);
}

@media (min-width: 768px) {
  .info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .info-hours {
    grid-column: 1 / -1;
  }
}
@media (min-width: 1024px) {
  .contact-grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    align-items: start;
  }
  .info-grid {
    grid-column: 1 / span 5;
    grid-template-columns: minmax(0, 1fr);
  }
  .map {
    grid-column: 6 / span 7;
    position: sticky;
    top: calc(var(--nav-h-compact) + 1.5rem);
  }
}
/* "Llamar" grande solo en móvil */
@media (min-width: 768px) {
  .phone-cta {
    display: none;
  }
}
</style>
