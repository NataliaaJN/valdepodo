<script setup lang="ts">
/**
 * Laboratorio · Plantilla conceptual y fibras (Fase 4, spec 04 §2.2-2.3, spec 08 §4).
 * La experiencia es `InsoleStory` (la misma de /servicios/plantillas-personalizadas); aquí se añade el
 * modo manual con deslizadores, el número de fibras y las estadísticas para validar los parámetros (Gate 4).
 */
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FIBER_COUNT } from '~/utils/insole-scene'
import type { SceneStats } from '~/utils/scene-types'

useSeoMeta({ title: 'Laboratorio · Plantilla y fibras', robots: 'noindex, nofollow' })

const explode = ref(0)
const build = ref(1)
const manual = ref(false)
const fiberOption = ref<'auto' | 'full' | 'lite'>('auto')
const stats = ref<(SceneStats & { buildMs: number }) | null>(null)

const fiberCount = computed(() => (fiberOption.value === 'auto' ? undefined : FIBER_COUNT[fiberOption.value]))

function toggleManual() {
  manual.value = !manual.value
  if (!manual.value) ScrollTrigger.refresh()
}
</script>

<template>
  <div>
    <LabFpsMeter />

    <div class="container-site pt-14">
      <NuxtLink to="/_lab" class="text-sm text-primary-strong underline underline-offset-4"
        >← Laboratorio</NuxtLink
      >
      <p class="eyebrow mt-6 text-primary-strong">Fase 4 · Plantillas personalizadas</p>
      <h1 class="mt-3 font-display text-display-l text-deep-blue">Plantilla <em>conceptual</em> y fibras</h1>
      <p class="mt-4 max-w-[62ch] text-text-secondary">
        Modelo generado con <code>tools/blender/build_insole.py</code> (capas <code>layer_*</code>) y fibras
        instanciadas en la GPU. Es una representación conceptual: no describe materiales ni procesos de
        fabricación.
      </p>

      <!-- Controles del laboratorio -->
      <div
        class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-m border border-border bg-white p-4 text-sm"
      >
        <button type="button" class="lab-chip" :aria-pressed="manual" @click="toggleManual">
          Modo manual
        </button>
        <label class="flex items-center gap-2" :class="{ 'opacity-40': !manual }">
          Explosión
          <input v-model.number="explode" type="range" min="0" max="1" step="0.01" :disabled="!manual" />
          <span class="w-9 tabular-nums">{{ Math.round(explode * 100) }}</span>
        </label>
        <label class="flex items-center gap-2" :class="{ 'opacity-40': !manual }">
          Construcción
          <input v-model.number="build" type="range" min="0" max="1" step="0.005" :disabled="!manual" />
          <span class="w-9 tabular-nums">{{ Math.round(build * 100) }}</span>
        </label>
        <div class="flex items-center gap-1.5">
          Fibras
          <button
            v-for="opt in ['auto', 'full', 'lite'] as const"
            :key="opt"
            type="button"
            class="lab-chip"
            :aria-pressed="fiberOption === opt"
            @click="fiberOption = opt"
          >
            {{ opt === 'auto' ? 'Según nivel' : FIBER_COUNT[opt].toLocaleString('es') }}
          </button>
        </div>
        <p v-if="stats" class="text-text-secondary tabular-nums">
          {{ stats.triangles.toLocaleString('es') }} triángulos · {{ stats.drawCalls }} draw calls · carga
          {{ Math.round(stats.buildMs) }} ms
        </p>
      </div>
    </div>

    <InsoleStory
      v-model:explode="explode"
      v-model:build="build"
      class="mt-12"
      :manual="manual"
      :fiber-count="fiberCount"
      :scene-key="`insole-${fiberOption}`"
      @stats="(s) => (stats = s)"
    />

    <div class="container-site py-24 text-text-secondary">
      Fin de la secuencia (aquí entraría el proceso de personalización).
    </div>
  </div>
</template>

<style scoped>
.lab-chip {
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border-strong);
  padding: 0.25rem 0.75rem;
  font-size: 0.8125rem;
  min-height: 32px;
}
.lab-chip[aria-pressed='true'] {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-white);
}
</style>
