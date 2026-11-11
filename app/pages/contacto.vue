<script setup lang="ts">
/**
 * Contacto (spec 07): datos como lista tipográfica con filetes (sin cajas) y mapa con fachada. Mismos datos
 * que el footer y el schema (`site.ts`), en `pending()` hasta confirmarlos. Prioriza claridad y uso.
 * Escritorio: lista 6 col + mapa fijo 5 col · tablet y móvil: apilado.
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
    <PageHeader id="contact-title" title="Estamos aquí para ayudarte." eyebrow="Contacto" />

    <section
      class="container-wide pb-(--space-section)"
      aria-label="Datos de contacto y mapa"
      data-nav-theme="bone"
    >
      <div class="contact-grid">
        <dl class="info-list">
          <div v-reveal class="info-row">
            <dt class="eyebrow text-primary-strong">Dirección</dt>
            <dd>
              <address class="info-value not-italic">
                <ContentValue :value="site.address.street" /><br />
                <ContentValue :value="site.address.postalCode" />{{ ' ' }}
                <ContentValue :value="site.address.locality" />
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
            </dd>
          </div>

          <div v-reveal="1" class="info-row">
            <dt class="eyebrow text-primary-strong">Teléfono</dt>
            <dd>
              <p class="info-value"><ContentValue :value="site.phone" /></p>
              <div class="info-actions">
                <span class="phone-cta"
                  ><BaseButton :href="clinic.phoneHref" size="sm">Llamar</BaseButton></span
                >
                <button type="button" class="copy-btn" @click="copy(clinic.phone, 'Teléfono')">
                  <BaseIcon name="copy" class="size-4" /> Copiar
                  <span class="sr-only">teléfono</span>
                </button>
              </div>
            </dd>
          </div>

          <div v-reveal="2" class="info-row">
            <dt class="eyebrow text-primary-strong">Email</dt>
            <dd>
              <p class="info-value break-all"><ContentValue :value="site.email" /></p>
              <div class="info-actions">
                <BaseButton variant="ghost" :href="clinic.mailHref">Escribir un correo</BaseButton>
              </div>
            </dd>
          </div>

          <div v-reveal="3" class="info-row">
            <dt class="eyebrow text-primary-strong">Instagram</dt>
            <dd>
              <p class="info-value">
                <ContentValue v-slot="{ value }" :value="site.instagram">{{ value.handle }}</ContentValue>
              </p>
              <div class="info-actions">
                <BaseButton variant="ghost" :href="clinic.instagram.url" target="_blank" rel="noopener">
                  Ver perfil<span class="sr-only"> de Instagram (se abre en una pestaña nueva)</span>
                </BaseButton>
              </div>
            </dd>
          </div>

          <div v-reveal="4" class="info-row">
            <dt class="eyebrow text-primary-strong">Horario</dt>
            <dd><OpeningHours /></dd>
          </div>
        </dl>

        <MapFacade v-reveal class="map" />
      </div>
      <p class="sr-only" aria-live="polite">{{ copied }}</p>
      <p v-if="copied" class="toast" aria-hidden="true">{{ copied }}</p>
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
  gap: 3rem;
}
.info-list {
  border-bottom: 1px solid var(--color-border);
}
.info-row {
  display: grid;
  gap: 0.75rem;
  border-top: 1px solid var(--color-border);
  padding-block: 1.5rem;
}
.info-value {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-heading-s);
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--color-ink);
}
.info-actions {
  margin-top: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1.5rem;
}
.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;
  font-size: 0.875rem;
  font-weight: 500;
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
  border-radius: var(--radius-m);
  background: var(--color-ink);
  color: var(--color-bone);
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

@media (min-width: 640px) {
  .info-row {
    grid-template-columns: 9rem minmax(0, 1fr);
    column-gap: 1.5rem;
  }
}
@media (min-width: 1024px) {
  .contact-grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: 1.5rem;
    align-items: start;
  }
  .info-list {
    grid-column: 1 / span 6;
  }
  .map {
    grid-column: 8 / span 5;
    position: sticky;
    top: calc(var(--nav-h-compact) + 1.5rem);
  }
}
/* "Llamar" grande solo en móvil (en el contenedor: el CSS con ámbito pisaría una utilidad hidden) */
@media (min-width: 768px) {
  .phone-cta {
    display: none;
  }
}
</style>
