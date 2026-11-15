<script setup lang="ts">
/**
 * Estudio biomecánico (spec 04 §1): hero con el mapa de presión que respira, introducción, secuencia de
 * huellas (experiencia nº 2), servicios relacionados y CTA. Textos clínicos en `pending`.
 */
import { pending } from '#shared/utils/pending'
import { ILLUSTRATIVE_LABEL, pressureStates } from '~/data/biomech'

const service = useServicePage('estudio-biomecanico')
const description = service.description
const intro = pending(
  '[Qué es el estudio biomecánico y qué permite analizar: texto pendiente de validar]',
  'Introducción del servicio (spec 04 §1.2): la redacta o valida la clínica',
)
const indicators = ['Estático', 'Marcha', 'Carrera']
</script>

<template>
  <div>
    <ServiceHero :service="service" :description="description" cta-label="Solicitar estudio" />

    <ServiceOverview :service="service" title="Entender tu pisada" :intro="intro">
      <svg
        viewBox="-24 -12 160 280"
        aria-hidden="true"
        focusable="false"
        class="mx-auto w-full max-w-[16rem] overflow-visible"
      >
        <PressureMap :state="pressureStates.standing" side="right" breathing :blur="3.5" />
      </svg>
      <ul class="mt-6 flex flex-wrap justify-center gap-2" role="list">
        <li
          v-for="label in indicators"
          :key="label"
          class="rounded-s bg-white px-3 py-1 text-sm font-semibold"
        >
          {{ label }}
        </li>
      </ul>
      <template #caption>{{ ILLUSTRATIVE_LABEL }}</template>
    </ServiceOverview>

    <!-- Secuencia de huellas (experiencia nº 2) -->
    <div class="chapter-bone-2 py-[clamp(3.5rem,6vw,5.5rem)]">
      <BiomechSequence />
    </div>

    <RelatedServices :slugs="service.related" />
  </div>
</template>
