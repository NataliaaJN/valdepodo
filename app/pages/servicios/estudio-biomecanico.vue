<script setup lang="ts">
/**
 * Estudio biomecánico (spec 04 §1). Fase 5: estructura mínima con la secuencia del laboratorio (Fase 3)
 * montada en su página; textos `pending`. Contenido completo, schema y "También te puede interesar": Fase 6.
 */
import { pending } from '#shared/utils/pending'
import { ILLUSTRATIVE_LABEL, pressureStates } from '~/data/biomech'
import { getService } from '~/data/services'

const service = getService('estudio-biomecanico')

useSeoMeta({
  title: service.name,
  description:
    'Estudio biomecánico de la pisada en Valdepodo: análisis estático, de la marcha y de la carrera.',
  robots: 'noindex, nofollow',
})

const description = pending(
  'Analizamos cómo apoyas y cómo te mueves para entender mejor tus pies.',
  'Descripción del servicio: validar con la clínica',
)
const intro = pending(
  '[Qué es el estudio biomecánico y qué permite analizar: texto pendiente de validar]',
  'Introducción del servicio (spec 04 §1.2): la redacta o valida la clínica',
)
const indicators = ['Estático', 'Marcha', 'Carrera']
const cta = { label: 'Solicitar estudio', to: '/pedir-cita?motivo=estudio-biomecanico' }
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="section-clip relative isolate" aria-labelledby="bio-title">
      <div
        class="pointer-events-none absolute inset-0 -z-10 bg-(image:--grad-atmosphere)"
        aria-hidden="true"
      />
      <div
        class="container-site grid gap-10 py-12 lg:min-h-[calc(100svh-var(--nav-h))] lg:grid-cols-2 lg:items-center lg:py-0"
      >
        <div>
          <p class="eyebrow text-primary-strong">Servicios · {{ service.number }}</p>
          <h1 id="bio-title" class="mt-4 font-display text-display-l text-deep-blue">
            Estudio <em class="text-primary">biomecánico</em>.
          </h1>
          <ContentValue
            :value="description"
            as="p"
            class="mt-6 max-w-[46ch] text-body-l text-text-secondary"
          />
          <div class="mt-8">
            <BaseButton :to="cta.to" arrow>{{ cta.label }}</BaseButton>
          </div>
        </div>
        <figure class="mx-auto w-full max-w-[15rem] sm:max-w-[19rem] lg:max-w-[23rem]">
          <svg viewBox="-24 -12 160 280" aria-hidden="true" focusable="false" class="w-full overflow-visible">
            <PressureMap :state="pressureStates.standing" side="right" breathing :blur="3.5" />
          </svg>
          <figcaption class="mt-3 text-center text-xs text-text-secondary">
            {{ ILLUSTRATIVE_LABEL }}
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- Introducción -->
    <section class="container-site py-(--space-section)" aria-labelledby="bio-intro">
      <h2 id="bio-intro" class="max-w-[20ch] font-display text-display-m text-deep-blue">
        Cada paso <em class="text-primary">cuenta</em>.
      </h2>
      <div class="mt-8 grid gap-10 lg:grid-cols-12">
        <ContentValue :value="intro" as="p" class="text-body-l text-text-secondary lg:col-span-6" />
        <ul class="grid grid-cols-3 gap-4 lg:col-span-5 lg:col-start-8" role="list">
          <li
            v-for="(label, i) in indicators"
            :key="label"
            class="rounded-m border border-border bg-white p-4 text-center"
          >
            <span class="font-display text-heading-s text-primary">0{{ i + 1 }}</span>
            <span class="mt-1 block text-sm font-semibold text-deep-blue">{{ label }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- Secuencia de huellas (experiencia nº 2) -->
    <div class="bg-white py-(--space-section)">
      <BiomechSequence />
    </div>

    <CtaBlock
      :title="{ before: 'Cada paso empieza por entender ', accent: 'cómo pisas' }"
      :cta="{ label: 'Solicitar estudio biomecánico', to: cta.to }"
    />
  </div>
</template>
