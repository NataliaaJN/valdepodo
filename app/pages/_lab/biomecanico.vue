<script setup lang="ts">
/**
 * Laboratorio · Estudio biomecánico (Fase 3). Recursos gráficos SVG + GSAP, sin WebGL:
 * 1. Maqueta del hero de /servicios/estudio-biomecanico con el mapa de presión que "respira" (spec 04 §1.1).
 * 2. Biblioteca de componentes gráficos (spec 08 §3) con sus estados.
 * 3. Secuencia de 6 fases (spec 04 §1.3): sticky en ≥ 768 px, tarjetas en móvil, reduced motion.
 */
import { pending } from '#shared/utils/pending'
import { ILLUSTRATIVE_LABEL, pressureStates, type PressureStateId } from '~/data/biomech'

useSeoMeta({ title: 'Laboratorio · Estudio biomecánico', robots: 'noindex, nofollow' })

const heroText = pending(
  'Analizamos cómo apoyas y cómo te mueves para entender mejor tus pies.',
  'Descripción del servicio: validar con la clínica',
)

const stateIds = Object.keys(pressureStates) as PressureStateId[]
const demoState = ref<PressureStateId>('standing')
const demoStride = ref<'walk' | 'run'>('walk')
const copProgress = ref(1)
const STATE_LABELS: Record<PressureStateId, string> = {
  idle: 'Sin carga',
  standing: 'Bipedestación',
  standingAlt: 'Variante (comparativa)',
  heelStrike: 'Contacto de talón',
  midstance: 'Apoyo medio',
  toeOff: 'Despegue',
  runForefoot: 'Carrera',
}
</script>

<template>
  <div>
    <LabFpsMeter />

    <!-- 1 · Hero -->
    <section class="relative overflow-hidden bg-surface">
      <div class="absolute inset-0 bg-(image:--grad-atmosphere)" aria-hidden="true" />
      <div
        class="container-site relative grid gap-10 py-14 lg:min-h-[calc(100svh-68px)] lg:grid-cols-2 lg:items-center lg:py-0"
      >
        <div>
          <NuxtLink to="/_lab" class="text-sm text-primary-strong underline underline-offset-4">
            ← Laboratorio · estudio biomecánico
          </NuxtLink>
          <p class="eyebrow mt-8 text-primary-strong">Servicios · 01</p>
          <h1 class="mt-3 font-display text-display-l text-deep-blue">Estudio <em>biomecánico</em>.</h1>
          <p class="mt-5 max-w-[46ch] text-body-l text-text-secondary">
            <ContentValue :value="heroText" />
          </p>
          <div class="mt-8">
            <BaseButton to="/_lab/biomecanico" arrow>Solicitar estudio</BaseButton>
          </div>
        </div>
        <figure class="mx-auto w-full max-w-[17rem] sm:max-w-[20rem] lg:max-w-[24rem]">
          <svg viewBox="-24 -12 160 280" aria-hidden="true" focusable="false" class="w-full overflow-visible">
            <PressureMap :state="pressureStates.standing" side="right" breathing :blur="3.5" />
          </svg>
          <figcaption class="mt-3 text-center text-xs text-text-secondary">
            {{ ILLUSTRATIVE_LABEL }}
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- 2 · Biblioteca -->
    <section class="container-site py-20">
      <p class="eyebrow text-primary-strong">Biblioteca SVG</p>
      <h2 class="mt-2 font-display text-display-m text-deep-blue">Recursos gráficos</h2>
      <p class="mt-3 max-w-[60ch] text-text-secondary">
        Todos los visuales son decorativos (<code>aria-hidden</code>) y se rotulan como «{{
          ILLUSTRATIVE_LABEL
        }}». Ningún valor representa una medición.
      </p>

      <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article class="lab-card">
          <h3 class="lab-title">Footprint</h3>
          <p class="lab-text">Izquierda/derecha · contorno, relleno, ambos.</p>
          <div class="mt-4 grid grid-cols-4 items-end gap-3">
            <FootprintSvg side="left" variant="outline" />
            <FootprintSvg side="right" variant="outline" />
            <FootprintSvg side="left" variant="fill" />
            <FootprintSvg side="right" variant="both" />
          </div>
        </article>

        <article class="lab-card">
          <h3 class="lab-title">PressureMap · estados</h3>
          <p class="lab-text">Morph entre estados de <code>app/data/biomech.ts</code>.</p>
          <div class="mt-4 flex gap-4">
            <svg viewBox="-4 -4 120 264" aria-hidden="true" class="w-28 shrink-0 overflow-visible">
              <PressureMap :state="pressureStates[demoState]" side="left" />
            </svg>
            <div class="flex flex-wrap content-start gap-1.5">
              <button
                v-for="id in stateIds"
                :key="id"
                type="button"
                class="lab-chip"
                :aria-pressed="demoState === id"
                @click="demoState = id"
              >
                {{ STATE_LABELS[id] }}
              </button>
            </div>
          </div>
        </article>

        <article class="lab-card">
          <h3 class="lab-title">SupportPoints · PressureCenterPath</h3>
          <p class="lab-text">Puntos de apoyo con pulso y centro de presiones (bucle y control manual).</p>
          <div class="mt-4 flex items-center gap-3">
            <svg viewBox="-4 -4 120 264" aria-hidden="true" class="min-w-0 flex-1 overflow-visible">
              <Footprint variant="both" />
              <SupportPoints />
            </svg>
            <svg viewBox="-4 -4 120 264" aria-hidden="true" class="min-w-0 flex-1 overflow-visible">
              <PressureMap :state="pressureStates.midstance" />
              <PressureCenterPath autoplay :duration="2.2" />
            </svg>
            <svg viewBox="-4 -4 120 264" aria-hidden="true" class="min-w-0 flex-1 overflow-visible">
              <Footprint variant="both" />
              <PressureCenterPath :progress="copProgress" />
            </svg>
          </div>
          <label class="mt-4 block text-sm text-text-secondary">
            Progreso {{ Math.round(copProgress * 100) }} %
            <input
              v-model.number="copProgress"
              type="range"
              min="0"
              max="1"
              step="0.01"
              class="mt-1 w-full"
            />
          </label>
        </article>

        <article class="lab-card">
          <h3 class="lab-title">GaitSequence · ProgressionLine</h3>
          <p class="lab-text">Marcha ↔ carrera con morph de la disposición.</p>
          <div class="mt-4 flex items-start gap-4">
            <GaitSequence :stride="demoStride" class="w-40 shrink-0" />
            <div class="flex flex-col gap-1.5">
              <button
                type="button"
                class="lab-chip"
                :aria-pressed="demoStride === 'walk'"
                @click="demoStride = 'walk'"
              >
                Marcha
              </button>
              <button
                type="button"
                class="lab-chip"
                :aria-pressed="demoStride === 'run'"
                @click="demoStride = 'run'"
              >
                Carrera
              </button>
            </div>
          </div>
        </article>

        <article class="lab-card sm:col-span-2">
          <h3 class="lab-title">FootJointsDiagram</h3>
          <p class="lab-text">
            Contorno lateral con ejes y arcos de movilidad. Sin rótulos anatómicos hasta la revisión de la
            podóloga.
          </p>
          <svg viewBox="0 0 360 240" aria-hidden="true" class="mt-4 w-full max-w-[32rem] overflow-visible">
            <FootJointsDiagram />
          </svg>
        </article>
      </div>
    </section>

    <!-- 3 · Secuencia -->
    <div class="bg-white py-20">
      <BiomechSequence />
    </div>

    <div class="container-site py-24 text-text-secondary">Fin de la secuencia (aquí entraría el CTA).</div>
  </div>
</template>

<style scoped>
.lab-card {
  border-radius: var(--radius-m);
  border: 1px solid var(--color-border);
  background: var(--color-white);
  padding: 1.5rem;
  box-shadow: var(--shadow-soft);
}
.lab-title {
  font-weight: 600;
  color: var(--color-deep-blue);
}
.lab-text {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}
.lab-chip {
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border-strong);
  padding: 0.25rem 0.75rem;
  font-size: 0.8125rem;
  color: var(--color-text);
  min-height: 32px;
}
.lab-chip[aria-pressed='true'] {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-white);
}
</style>
