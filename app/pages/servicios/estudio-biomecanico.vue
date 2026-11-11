<script setup lang="ts">
/**
 * Estudio biomecánico (spec 04 §1): hero con el mapa de presión que respira, introducción, secuencia de
 * huellas (experiencia nº 2), servicios relacionados y CTA. Textos clínicos en `pending`.
 */
import { pending } from '#shared/utils/pending'
import { ILLUSTRATIVE_LABEL, pressureStates } from '~/data/biomech'
import { bookingPath } from '~/data/services'

const service = useServicePage('estudio-biomecanico')
const description = service.description
const intro = pending(
  '[Qué es el estudio biomecánico y qué permite analizar: texto pendiente de validar]',
  'Introducción del servicio (spec 04 §1.2): la redacta o valida la clínica',
)
const indicators = ['Estático', 'Marcha', 'Carrera']
const cta = { label: 'Solicitar estudio', to: bookingPath(service.slug) }
</script>

<template>
  <div>
    <!-- Hero -->
    <ServiceHero :service="service" :description="description" cta-label="Solicitar estudio">
      <svg
        viewBox="-24 -12 160 280"
        aria-hidden="true"
        focusable="false"
        class="mx-auto w-full max-w-[16rem] overflow-visible"
      >
        <PressureMap :state="pressureStates.standing" side="right" breathing :blur="3.5" />
      </svg>
      <template #caption>{{ ILLUSTRATIVE_LABEL }}</template>
    </ServiceHero>

    <!-- Introducción -->
    <section class="container-site py-(--space-section)" aria-labelledby="bio-intro">
      <h2 id="bio-intro" class="max-w-[20ch] font-display text-display-m text-deep-blue">
        Cada paso <em>cuenta</em>.
      </h2>
      <div class="mt-8 grid gap-10 lg:grid-cols-12">
        <ContentValue :value="intro" as="p" class="text-body-l text-text-secondary lg:col-span-6" />
        <ul class="grid grid-cols-3 gap-4 lg:col-span-5 lg:col-start-8" role="list">
          <li v-for="(label, i) in indicators" :key="label" class="rounded-m bg-white p-4 text-center">
            <span class="font-display text-heading-s text-primary">0{{ i + 1 }}</span>
            <span class="mt-1 block text-sm font-semibold text-deep-blue">{{ label }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- Secuencia de huellas (experiencia nº 2) -->
    <div class="chapter-bone-2 py-(--space-section)">
      <BiomechSequence />
    </div>

    <RelatedServices :slugs="service.related" />

    <CtaBlock
      :title="{ before: 'Cada paso empieza por entender ', accent: 'cómo pisas' }"
      :cta="{ label: 'Solicitar estudio biomecánico', to: cta.to }"
    />
  </div>
</template>
