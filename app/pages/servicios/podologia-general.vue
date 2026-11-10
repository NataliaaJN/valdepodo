<script setup lang="ts">
/**
 * Podología general (spec 04 §3): hero, intro breve y cuatro tratamientos en filas editoriales.
 */
import { pending } from '#shared/utils/pending'
import { bookingPath } from '~/data/services'
import { treatments } from '~/data/treatments'

const service = useServicePage('podologia-general')

const intro = pending(
  'Muchas molestias del pie tienen solución sencilla si se tratan a tiempo. Te explicamos qué ocurre y cómo evitar que vuelva a pasar.',
  'Introducción de podología general (spec 04 §3): validar con la clínica',
)
</script>

<template>
  <div>
    <ServiceHero
      :service="service"
      :title="{ before: 'Cuidar tus pies también es ', accent: 'prevenir', after: '.' }"
      :description="service.description"
    >
      <div
        class="mx-auto aspect-[200/170] w-full max-w-[22rem] rounded-[var(--radius-organic)] bg-white/70 p-8"
      >
        <TreatmentIllustration kind="ingrown" />
      </div>
    </ServiceHero>

    <section class="bg-white py-(--space-section)" aria-labelledby="treatments-title">
      <div class="container-site">
        <SectionHeading
          id="treatments-title"
          eyebrow="Tratamientos"
          :title="{ before: 'Las molestias ', accent: 'más frecuentes', after: '.' }"
          :intro="intro"
        />
        <ul class="mt-12 border-t border-border" role="list">
          <TreatmentRow
            v-for="t in treatments"
            :key="t.number"
            v-reveal
            :treatment="t"
            :to="bookingPath(service.slug)"
          />
        </ul>
      </div>
    </section>

    <RelatedServices :slugs="service.related" />

    <CtaBlock
      :title="{ before: 'No dejes que las molestias condicionen ', accent: 'tus pasos' }"
      :cta="{ label: 'Pedir cita', to: bookingPath(service.slug) }"
    />
  </div>
</template>
