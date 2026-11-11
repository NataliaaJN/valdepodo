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
    <ServiceHero
      :service="service"
      :statement="description"
      :description="service.description"
      :cta-label="cta.label"
    >
      <picture>
        <source
          srcset="
            /images/3d-fallbacks/insole/complete-800.avif  800w,
            /images/3d-fallbacks/insole/complete.avif     1600w
          "
          sizes="(min-width: 1024px) 40vw, 100vw"
          type="image/avif"
        />
        <img
          src="/images/3d-fallbacks/insole/complete.webp"
          srcset="
            /images/3d-fallbacks/insole/complete-800.webp  800w,
            /images/3d-fallbacks/insole/complete.webp     1600w
          "
          sizes="(min-width: 1024px) 40vw, 100vw"
          alt=""
          width="1600"
          height="1200"
          class="float relative w-full"
          loading="lazy"
        />
      </picture>
      <template #caption>{{ CONCEPTUAL_LABEL }}</template>
    </ServiceHero>

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
