<script setup lang="ts">
/**
 * Plantillas personalizadas (spec 04 §2): hero, plantilla descompuesta + fibras (experiencia nº 3),
 * proceso de personalización, servicios relacionados y CTA. Textos en `pending`.
 * Un único lienzo WebGL por página (spec 08 §1.2): el hero usa el póster de Blender de la plantilla completa
 * y la escena 3D vive en la experiencia de capas y fibras.
 */
import { pending } from '#shared/utils/pending'
import { CONCEPTUAL_LABEL, insoleProcess } from '~/data/insole'
import { bookingPath } from '~/data/services'

const service = useServicePage('plantillas-personalizadas')

const description = pending(
  'No existen dos pies iguales. Tus plantillas tampoco deberían serlo.',
  'Descripción del servicio (concepto de la spec 04 §2): validar con la clínica',
)
const cta = { label: 'Pedir cita', to: bookingPath(service.slug) }
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="section-clip relative isolate" aria-labelledby="ins-title">
      <div
        class="pointer-events-none absolute inset-0 -z-10 bg-(image:--grad-atmosphere)"
        aria-hidden="true"
      />
      <div class="container-site pt-8 lg:pt-10">
        <SiteBreadcrumbs
          :items="[
            { name: 'Inicio', to: '/' },
            { name: 'Servicios', to: '/servicios' },
            { name: service.name },
          ]"
        />
      </div>
      <div
        class="container-site grid gap-10 py-12 lg:min-h-[calc(100svh-var(--nav-h)-5rem)] lg:grid-cols-12 lg:items-center lg:py-0"
      >
        <div class="lg:col-span-5">
          <p class="eyebrow text-primary-strong">Servicios · {{ service.number }}</p>
          <h1 id="ins-title" class="mt-4 font-display text-display-l text-deep-blue">
            Plantillas <em class="text-primary">personalizadas</em>.
          </h1>
          <ContentValue
            :value="description"
            as="p"
            class="mt-6 max-w-[44ch] text-body-l text-text-secondary"
          />
          <div class="mt-8">
            <BaseButton :to="cta.to" arrow>{{ cta.label }}</BaseButton>
          </div>
        </div>
        <figure class="hero-insole lg:col-span-7">
          <div class="orbit" aria-hidden="true"><OrganicLines /></div>
          <picture>
            <source
              srcset="
                /images/3d-fallbacks/insole/complete-800.avif  800w,
                /images/3d-fallbacks/insole/complete.avif     1600w
              "
              sizes="(min-width: 1024px) 55vw, 100vw"
              type="image/avif"
            />
            <img
              src="/images/3d-fallbacks/insole/complete.webp"
              srcset="
                /images/3d-fallbacks/insole/complete-800.webp  800w,
                /images/3d-fallbacks/insole/complete.webp     1600w
              "
              sizes="(min-width: 1024px) 55vw, 100vw"
              alt=""
              width="1600"
              height="1200"
              class="float relative w-full"
              fetchpriority="high"
            />
          </picture>
          <figcaption class="text-center text-xs text-text-secondary">{{ CONCEPTUAL_LABEL }}</figcaption>
        </figure>
      </div>
    </section>

    <!-- Plantilla descompuesta + fibras (experiencia nº 3) -->
    <InsoleStory class="pt-(--space-section)" />

    <!-- Proceso de personalización (spec 04 §2.4) -->
    <section class="container-site py-(--space-section)" aria-labelledby="ins-process">
      <SectionHeading
        id="ins-process"
        eyebrow="Proceso"
        :title="{ before: 'Cómo personalizamos ', accent: 'tus plantillas', after: '' }"
      />
      <StepList :steps="insoleProcess" horizontal class="mt-12" />
    </section>

    <RelatedServices :slugs="service.related" />

    <CtaBlock
      :title="{ before: 'El soporte adecuado empieza con un ', accent: 'buen análisis' }"
      :cta="cta"
    />
  </div>
</template>

<style scoped>
.hero-insole {
  position: relative;
}
.orbit {
  position: absolute;
  inset: 8% 4% 12%;
}
.float {
  animation: float 7s var(--ease-in-out-soft) infinite alternate;
}
@keyframes float {
  from {
    transform: translateY(-6px) rotate(-0.6deg);
  }
  to {
    transform: translateY(8px) rotate(0.6deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .float {
    animation: none;
  }
}
</style>
