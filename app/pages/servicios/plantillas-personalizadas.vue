<script setup lang="ts">
/**
 * Plantillas personalizadas (spec 04 §2). Fase 5: estructura mínima con la experiencia del laboratorio
 * (Fase 4) montada en su página; textos `pending`.
 * Un único lienzo WebGL por página (spec 08 §1.2): el hero usa el póster de Blender de la plantilla completa
 * y la escena 3D vive en la experiencia de capas y fibras.
 */
import { pending } from '#shared/utils/pending'
import { CONCEPTUAL_LABEL } from '~/data/insole'
import { getService } from '~/data/services'

const service = getService('plantillas-personalizadas')

useSeoMeta({
  title: service.name,
  description: 'Plantillas personalizadas en Valdepodo, diseñadas a partir de la valoración de tu pie.',
  robots: 'noindex, nofollow',
})

const description = pending(
  'No existen dos pies iguales. Tus plantillas tampoco deberían serlo.',
  'Descripción del servicio (concepto de la spec 04 §2): validar con la clínica',
)
const cta = { label: 'Pedir cita', to: '/pedir-cita?motivo=plantillas-personalizadas' }
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="section-clip relative isolate" aria-labelledby="ins-title">
      <div
        class="pointer-events-none absolute inset-0 -z-10 bg-(image:--grad-atmosphere)"
        aria-hidden="true"
      />
      <div
        class="container-site grid gap-10 py-12 lg:min-h-[calc(100svh-var(--nav-h))] lg:grid-cols-12 lg:items-center lg:py-0"
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
