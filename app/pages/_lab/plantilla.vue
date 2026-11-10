<script setup lang="ts">
/**
 * Laboratorio · Plantilla conceptual y fibras (Fase 4, spec 04 §2.2-2.3, spec 08 §4).
 * - ≥ 768 px: escena sticky; ScrollTrigger (scrub) anima `explode` en la parte A y `build` en la parte B.
 * - < 768 px: sin sticky ni scrub; la escena se reproduce sola (explosión 1,6 s / construcción 3 s)
 *   al entrar en viewport, con selector "Capas / Construcción".
 * - Nivel `static` (incluye reduced motion): póster + listas.
 * - Modo manual con deslizadores para validar los parámetros (Gate 4).
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { LayerAnchor } from '~/components/three/InsoleModel.vue'
import { CONCEPTUAL_LABEL, fiberSteps, insoleLayers } from '~/data/insole'
import { FIBER_COUNT } from '~/utils/insole-scene'
import type { SceneStats } from '~/utils/scene-types'

useSeoMeta({ title: 'Laboratorio · Plantilla y fibras', robots: 'noindex, nofollow' })

const reducedMotion = useReducedMotion()
const root = ref<HTMLElement | null>(null)
const partA = ref<HTMLElement | null>(null)
const partB = ref<HTMLElement | null>(null)
const stage = ref<HTMLElement | null>(null)

const explode = ref(0)
const build = ref(1)
const manual = ref(false)
const fiberOption = ref<'auto' | 'full' | 'lite'>('auto')
const stats = ref<(SceneStats & { buildMs: number }) | null>(null)
const anchors = ref<LayerAnchor[]>([])
const isMobile = ref(false)
const mobileMode = ref<'layers' | 'fibers'>('layers')

const fiberCount = computed(() => (fiberOption.value === 'auto' ? undefined : FIBER_COUNT[fiberOption.value]))
const sceneKey = computed(() => `insole-${fiberOption.value}`)
const loader = () => import('~/components/three/InsoleScene.client.vue')
const sceneProps = computed(() => ({
  explode: explode.value,
  build: build.value,
  motion: !reducedMotion.value,
  fiberCount: fiberCount.value,
  onStats: (s: SceneStats & { buildMs: number }) => (stats.value = s),
  onAnchors: (a: LayerAnchor[]) => (anchors.value = a),
}))

/** Separación (en % del ancho de la escena) entre el extremo de la capa y su etiqueta. */
const LABEL_GAP = 4

/** Etiquetas: aparecen escalonadas entre el 30 % y el 90 % de la explosión (spec 04 §2.2). */
const labels = computed(() =>
  insoleLayers.map((layer, i) => {
    const side = i % 2 === 0 ? 'right' : 'left'
    const found = anchors.value.find((a) => a.id === layer.id)
    const anchor = found ? found[side] : undefined
    const start = 0.3 + i * 0.15
    const visible = build.value > 0.99 && explode.value >= start
    return { ...layer, anchor, visible, side }
  }),
)
const activeStep = computed(() => {
  if (build.value >= 0.999) return -1
  return fiberSteps.findIndex((s) => build.value >= s.range[0] && build.value < s.range[1])
})

/* ----- Scroll (≥ 768 px) ----- */
useGsapContext(root, (c) => {
  isMobile.value = c.mobile
  if (manual.value) return undefined
  if (c.mobile) {
    explode.value = 0
    build.value = 1
    return undefined
  }
  const scrub = c.reduce ? false : 0.6
  ScrollTrigger.create({
    trigger: partA.value,
    start: 'top 60%',
    end: 'bottom 70%',
    scrub,
    onUpdate: (self) => {
      if (manual.value) return
      build.value = 1
      explode.value = self.progress
    },
  })
  ScrollTrigger.create({
    trigger: partB.value,
    start: 'top 60%',
    end: 'bottom 75%',
    scrub,
    onUpdate: (self) => {
      if (manual.value) return
      explode.value = 0
      build.value = self.progress
    },
    onLeaveBack: () => {
      if (!manual.value) build.value = 1
    },
  })
  return undefined
})

/* ----- Móvil: reproducción autónoma al entrar en viewport ----- */
let tween: gsap.core.Tween | undefined
function playMobile(mode: 'layers' | 'fibers') {
  mobileMode.value = mode
  tween?.kill()
  const proxy = { v: 0 }
  if (reducedMotion.value) {
    explode.value = mode === 'layers' ? 1 : 0
    build.value = 1
    return
  }
  if (mode === 'layers') {
    build.value = 1
    tween = gsap.to(proxy, {
      v: 1,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => (explode.value = proxy.v),
    })
  } else {
    explode.value = 0
    build.value = 0
    tween = gsap.to(proxy, { v: 1, duration: 3, ease: 'none', onUpdate: () => (build.value = proxy.v) })
  }
}
let observer: IntersectionObserver | undefined
onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting && isMobile.value && !manual.value) {
        playMobile(mobileMode.value)
        observer?.disconnect()
      }
    },
    { threshold: 0.5 },
  )
  if (stage.value) observer.observe(stage.value)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  tween?.kill()
})

function toggleManual() {
  manual.value = !manual.value
  if (!manual.value) ScrollTrigger.refresh()
}
</script>

<template>
  <div ref="root">
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

    <section class="section-clip">
      <div class="container-site mt-12 md:grid md:grid-cols-12 md:gap-10">
        <!-- Escena -->
        <div class="md:order-2 md:col-span-7">
          <div class="md:sticky md:top-0 md:flex md:h-svh md:items-center">
            <figure ref="stage" class="relative w-full" aria-hidden="true">
              <SceneGate
                :key="sceneKey"
                :loader="loader"
                :scene-props="sceneProps"
                poster="/images/3d-fallbacks/insole/exploded"
                poster-small
                poster-sizes="(min-width: 768px) 58vw, 100vw"
                aspect-ratio="4 / 3"
              />
              <!-- Etiquetas de las capas (equivalente accesible: la lista de la parte A) -->
              <svg
                class="pointer-events-none absolute inset-0 size-full overflow-visible"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <template v-for="label in labels" :key="label.id">
                  <line
                    v-if="label.anchor"
                    :x1="label.anchor.x * 100"
                    :y1="label.anchor.y * 100"
                    :x2="
                      label.side === 'right'
                        ? label.anchor.x * 100 + LABEL_GAP
                        : label.anchor.x * 100 - LABEL_GAP
                    "
                    :y2="label.anchor.y * 100"
                    class="label-line"
                    :class="{ 'is-on': label.visible }"
                    vector-effect="non-scaling-stroke"
                  />
                </template>
              </svg>
              <template v-for="label in labels" :key="label.id">
                <div
                  v-if="label.anchor"
                  class="insole-label"
                  :class="[`is-${label.side}`, { 'is-on': label.visible }]"
                  :style="
                    label.side === 'right'
                      ? { top: `${label.anchor.y * 100}%`, left: `${label.anchor.x * 100 + LABEL_GAP}%` }
                      : {
                          top: `${label.anchor.y * 100}%`,
                          right: `${100 - label.anchor.x * 100 + LABEL_GAP}%`,
                        }
                  "
                >
                  <span class="font-display text-primary">{{ label.number }}</span>
                  <!-- En móvil solo el número: el nombre está en la lista numerada (spec 04 §2.2) -->
                  <span class="hidden md:inline">{{ label.label }}</span>
                </div>
                <span
                  v-if="label.anchor"
                  class="insole-dot"
                  :class="{ 'is-on': label.visible }"
                  :style="{ left: `${label.anchor.x * 100}%`, top: `${label.anchor.y * 100}%` }"
                />
              </template>
              <figcaption class="mt-2 text-center text-xs text-text-secondary">
                {{ CONCEPTUAL_LABEL }}
              </figcaption>
            </figure>
          </div>
          <div class="mt-4 flex justify-center gap-2 md:hidden">
            <button
              type="button"
              class="lab-chip"
              :aria-pressed="mobileMode === 'layers'"
              @click="playMobile('layers')"
            >
              Capas
            </button>
            <button
              type="button"
              class="lab-chip"
              :aria-pressed="mobileMode === 'fibers'"
              @click="playMobile('fibers')"
            >
              Construcción
            </button>
          </div>
        </div>

        <!-- Texto -->
        <div class="mt-12 md:order-1 md:col-span-5 md:mt-0">
          <div ref="partA" class="part">
            <p class="eyebrow text-primary-strong">Plantilla descompuesta</p>
            <h2 class="mt-3 font-display text-display-m text-deep-blue">Capa a <em>capa</em>.</h2>
            <ol class="mt-8 grid gap-6">
              <li v-for="layer in insoleLayers" :key="layer.id" class="flex gap-4">
                <span class="font-display text-heading-s text-primary">{{ layer.number }}</span>
                <div>
                  <h3 class="font-semibold text-deep-blue">{{ layer.label }}</h3>
                  <ContentValue
                    v-if="layer.description"
                    :value="layer.description"
                    as="p"
                    class="text-sm text-text-secondary"
                  />
                </div>
              </li>
            </ol>
          </div>

          <div ref="partB" class="part mt-24">
            <p class="eyebrow text-primary-strong">Construcción mediante fibras</p>
            <h2 class="mt-3 font-display text-display-m text-deep-blue">Hecha <em>para ti</em>.</h2>
            <ol class="mt-8 grid gap-8">
              <li
                v-for="(step, i) in fiberSteps"
                :key="step.number"
                class="fiber-step flex gap-4"
                :class="{ 'is-active': i === activeStep }"
              >
                <span class="font-display text-heading-s text-primary">{{ step.number }}</span>
                <div>
                  <h3 class="font-semibold text-deep-blue">{{ step.title }}</h3>
                  <ContentValue :value="step.text" as="p" class="text-text-secondary" />
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>

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

@media (min-width: 768px) {
  .part {
    min-height: 140svh;
    padding-top: 30svh;
  }
}

.label-line {
  stroke: var(--color-primary);
  stroke-width: 1;
  stroke-dasharray: 3 3;
  opacity: 0;
  transition: opacity 300ms ease;
}
.insole-label,
.insole-dot {
  position: absolute;
  opacity: 0;
  transition: opacity 300ms ease;
}
.label-line.is-on,
.insole-label.is-on,
.insole-dot.is-on {
  opacity: 1;
}
.insole-label {
  transform: translateY(-50%);
  white-space: nowrap;
  border-radius: var(--radius-pill);
  background: rgb(255 255 255 / 0.85);
  backdrop-filter: blur(6px);
  padding: 0.25rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-deep-blue);
  box-shadow: var(--shadow-soft);
}
.insole-dot {
  width: 9px;
  height: 9px;
  margin: -4.5px 0 0 -4.5px;
  border-radius: 999px;
  background: var(--color-white);
  border: 2px solid var(--color-primary);
}

.fiber-step {
  transition: opacity 300ms ease;
}
@media (min-width: 768px) {
  .fiber-step:not(.is-active) {
    opacity: 0.45;
  }
}
@media (prefers-reduced-motion: reduce) {
  .label-line,
  .insole-label,
  .insole-dot,
  .fiber-step {
    transition: none;
  }
}
</style>
