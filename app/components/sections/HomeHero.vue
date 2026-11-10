<script setup lang="ts">
/**
 * Hero de la Home con el pie anatómico (spec 03 §1). Propuesta visual (Fase 5).
 * - ≥ 1024 px y nivel `full`: sección pineada (~250 %) con scrub; el progreso fija capa, rotación y frase.
 * - Tablet o `lite`: sin pin; scrub corto sobre la propia sección (rotación + paso a huesos).
 * - Móvil: sin pin ni scrub; el modelo responde a los controles.
 * - `static` (incluye reduced motion): pósters por capa conmutables con los mismos controles.
 * El estado es declarativo (capa, rotación): ScrollTrigger y los controles solo cambian refs (spec 08 §1.4).
 * Si el usuario elige una capa durante la secuencia, manda hasta que el scroll entra en otro tramo.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { site } from '~/data/site'
import { HERO_EXIT_START, hero, heroLayers, heroRotationAt, heroSequence, heroStepIndex } from '~/data/home'
import { FOOT_LAYER_LABELS, type FootLayer } from '~/utils/foot-layers'

const section = ref<HTMLElement | null>(null)
const { tier, resolved } = useDeviceTier()

const progress = ref(0)
const manualLayer = ref<FootLayer | null>(null)
const available = ref<FootLayer[] | null>(null)
const userRotation = reactive({ value: 0 })
const sceneReady = ref(false)

const stepIndex = computed(() => heroStepIndex(progress.value))
const step = computed(() => heroSequence[stepIndex.value]!)
watch(stepIndex, () => (manualLayer.value = null))

const activeLayer = computed<FootLayer>(() => manualLayer.value ?? step.value.layer)
const layers = computed(() =>
  heroLayers.filter((l) => (available.value ? available.value.includes(l) : true)),
)
const MAX_USER_ROTATION = Math.PI / 3 // ±60° (spec 03 §1)
const rotationY = computed(() => heroRotationAt(progress.value) + userRotation.value)

const exit = computed(() => {
  const t = Math.min(1, Math.max(0, (progress.value - HERO_EXIT_START) / (1 - HERO_EXIT_START)))
  return t * t * (3 - 2 * t)
})
const modelStyle = computed(() =>
  exit.value > 0
    ? {
        transform: `translate3d(${exit.value * 14}%, ${exit.value * -4}%, 0) scale(${1 - exit.value * 0.22})`,
        opacity: String(1 - exit.value * 0.9),
      }
    : undefined,
)

const isStatic = computed(() => !resolved.value || tier.value === 'static')
// El póster sigue a la capa elegida hasta que la escena está lista (en `lite` se carga al interactuar)
const poster = computed(
  () => `/images/3d-fallbacks/foot/${isStatic.value || !sceneReady.value ? activeLayer.value : 'skin'}`,
)

const loader = () => import('~/components/three/FootAnatomy.client.vue')
const sceneProps = computed(() => ({
  activeLayer: activeLayer.value,
  rotationY: rotationY.value,
  onLayers: (l: FootLayer[]) => (available.value = l),
}))

function selectLayer(layer: FootLayer) {
  manualLayer.value = layer === step.value.layer ? null : layer
}

/* ----- Rotación manual: arrastre horizontal (pan-y deja pasar el scroll) y botones ----- */
let dragX: number | null = null
let dragTween: gsap.core.Tween | undefined
const clampRotation = (v: number) => Math.max(-MAX_USER_ROTATION, Math.min(MAX_USER_ROTATION, v))

function onPointerDown(e: PointerEvent) {
  if (isStatic.value) return
  dragTween?.kill()
  dragX = e.clientX
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onPointerMove(e: PointerEvent) {
  if (dragX === null) return
  userRotation.value = clampRotation(userRotation.value + (e.clientX - dragX) * 0.008)
  dragX = e.clientX
}
function onPointerUp(e: PointerEvent) {
  if (dragX === null) return
  dragX = null
  // Escritorio: vuelve suavemente a la orientación de la secuencia al soltar (spec 03 §1)
  if (e.pointerType === 'mouse') {
    dragTween = gsap.to(userRotation, { value: 0, duration: 0.9, ease: 'power3.out' })
  }
}
function rotate(step: number) {
  dragTween?.kill()
  userRotation.value = clampRotation(userRotation.value + step)
}

/* ----- Secuencia de scroll ----- */
useGsapContext(section, (c) => {
  progress.value = 0
  if (c.reduce || c.mobile || tier.value === 'static') return undefined
  if (c.desktop && tier.value === 'full') {
    ScrollTrigger.create({
      trigger: section.value,
      start: 'top top',
      end: '+=250%',
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => (progress.value = self.progress),
    })
  } else {
    // Tablet / lite: rotación corta y paso a huesos mientras la sección sale de la pantalla
    ScrollTrigger.create({
      trigger: section.value,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.6,
      onUpdate: (self) => (progress.value = self.progress * (HERO_EXIT_START - 0.01)),
    })
  }
  return undefined
})

onBeforeUnmount(() => dragTween?.kill())

const layerIcons: Record<FootLayer, string> = {
  skin: 'M6 20c-1.5-4 0-8 2-11s3-5 6-5 4 3 3 6-3 4-3 7 1 4-1 5-4 1-7-2Z',
  muscles: 'M5 7c3 2 6 2 9 0s5-2 6 0M4 12c3 2 7 2 10 0s5-2 6 0M5 17c3 2 6 2 9 0s5-2 6 0',
  tendons: 'M7 4c1 5 1 11 0 16M12 4c0 5 0 11 0 16M17 4c-1 5-1 11 0 16',
  ligaments: 'M5 9h14M5 15h14',
  bones:
    'M7.5 5.5a2 2 0 1 0-2 2l11 11a2 2 0 1 0 2-2M7.5 5.5a2 2 0 1 1 2 2M18.5 16.5a2 2 0 1 0-2 2M9.5 7.5l7 7',
}
</script>

<template>
  <section ref="section" class="hero under-navbar section-clip relative isolate" aria-labelledby="hero-title">
    <!-- Atmósfera de fondo -->
    <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div class="blob blob-a" />
      <div class="blob blob-b" />
    </div>

    <div class="container-site hero-grid">
      <!-- Texto -->
      <div class="hero-copy">
        <p class="eyebrow text-primary-strong">Clínica de podología · <ContentValue :value="site.city" /></p>
        <h1 id="hero-title" class="mt-5 font-display text-display-xl text-deep-blue">
          {{ hero.title.before }}<em class="text-primary">{{ hero.title.accent }}</em
          >{{ hero.title.after }}
        </h1>
        <ContentValue
          :value="hero.description"
          as="p"
          class="mt-6 max-w-[44ch] text-body-l text-text-secondary"
        />
        <div class="mt-8 flex flex-wrap gap-3">
          <BaseButton :to="hero.primaryCta.to" arrow>{{ hero.primaryCta.label }}</BaseButton>
          <BaseButton variant="secondary" :to="hero.secondaryCta.to">{{
            hero.secondaryCta.label
          }}</BaseButton>
        </div>

        <!-- Frases de la secuencia (solo con el pin activo) -->
        <div class="sequence-text mt-12" aria-hidden="true">
          <template v-for="(s, i) in heroSequence" :key="i">
            <ContentValue
              v-if="s.text"
              :value="s.text"
              as="p"
              class="sequence-line font-display text-heading-s text-deep-blue"
              :class="{ 'is-on': i === stepIndex && progress > 0.02 }"
            />
          </template>
        </div>
      </div>

      <!-- Modelo -->
      <div class="hero-visual">
        <div class="orbit" aria-hidden="true">
          <OrganicLines />
        </div>

        <div class="model-wrap" :style="modelStyle">
          <figure
            class="model"
            :class="{ 'is-interactive': !isStatic }"
            aria-hidden="true"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
          >
            <SceneGate
              :loader="loader"
              :scene-props="sceneProps"
              :poster="poster"
              poster-small
              poster-sizes="(min-width: 1024px) 60vw, 100vw"
              aspect-ratio="1 / 1"
              priority
              @ready="sceneReady = true"
            />
          </figure>

          <!-- Elementos flotantes -->
          <div class="chip chip-layer" aria-hidden="true">
            <span class="font-display text-primary tabular-nums">0{{ layers.indexOf(activeLayer) + 1 }}</span>
            <span class="text-text-secondary">/ 0{{ layers.length }}</span>
            <span class="font-semibold text-deep-blue">{{ FOOT_LAYER_LABELS[activeLayer] }}</span>
          </div>
          <div class="chip chip-points" aria-hidden="true">
            <span v-for="n in 3" :key="n" class="pulse" :style="{ '--d': `${n * 0.4}s` }" />
          </div>
        </div>

        <!-- Controles de capa (accesibles: el modelo es aria-hidden) -->
        <div class="controls">
          <div class="layer-group" role="group" aria-label="Capa del modelo">
            <button
              v-for="layer in layers"
              :key="layer"
              type="button"
              class="layer-btn"
              :aria-pressed="activeLayer === layer"
              @click="selectLayer(layer)"
            >
              <svg viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true">
                <path
                  :d="layerIcons[layer]"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              {{ FOOT_LAYER_LABELS[layer] }}
            </button>
          </div>
          <div v-if="!isStatic" class="flex gap-1">
            <button
              type="button"
              class="rotate-btn"
              aria-label="Girar el modelo a la izquierda"
              @click="rotate(-0.4)"
            >
              <svg viewBox="0 0 16 16" class="size-4" fill="none" aria-hidden="true">
                <path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </button>
            <button
              type="button"
              class="rotate-btn"
              aria-label="Girar el modelo a la derecha"
              @click="rotate(0.4)"
            >
              <svg viewBox="0 0 16 16" class="size-4" fill="none" aria-hidden="true">
                <path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <PendingBadge
            label="Modelo provisional"
            note="Prototipo de la Fase 2: pendiente de la revisión anatómica de la podóloga (Gate 2)"
          />
          <p class="text-xs text-text-secondary">
            Modelo basado en BodyParts3D, © DBCLS,
            <a
              href="https://creativecommons.org/licenses/by/4.0/deed.es"
              class="underline underline-offset-2"
              rel="license noopener"
              target="_blank"
              >CC BY 4.0</a
            >
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  --hero-min: 680px;
}
.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2.5rem;
  padding-block: 2.5rem 4rem;
}
@media (min-width: 768px) {
  .hero-grid {
    grid-template-columns: repeat(8, minmax(0, 1fr));
    column-gap: 1.5rem;
  }
  .hero-copy {
    grid-column: 1 / span 6;
  }
  .hero-visual {
    grid-column: 3 / span 6;
  }
}
@media (min-width: 1024px) {
  .hero {
    min-height: max(100svh, var(--hero-min));
  }
  .hero-grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    align-items: center;
    min-height: calc(max(100svh, var(--hero-min)) - var(--nav-h));
    padding-block: 1rem 2rem;
  }
  .hero-copy {
    grid-column: 1 / span 5;
    grid-row: 1;
    position: relative;
    z-index: 2;
  }
  .hero-visual {
    /* Se solapa ligeramente con el texto (col 5-12) */
    grid-column: 5 / span 8;
    grid-row: 1;
  }
}

/* Degradados radiales ya difusos: sin filter: blur (pintado caro en móvil) */
.blob {
  position: absolute;
  border-radius: 999px;
}
.blob-a {
  width: min(70vw, 900px);
  aspect-ratio: 1;
  right: -12%;
  top: 4%;
  background: radial-gradient(circle, rgb(185 229 243 / 0.85), transparent 68%);
}
.blob-b {
  width: min(40vw, 520px);
  aspect-ratio: 1;
  right: 28%;
  bottom: -10%;
  background: radial-gradient(circle, rgb(30 171 225 / 0.16), transparent 70%);
}

.hero-visual {
  position: relative;
}
.orbit {
  position: absolute;
  inset: 4% -2% 14%;
  pointer-events: none;
}
.model-wrap {
  position: relative;
  margin-inline: auto;
  width: min(100%, 70svh);
  will-change: transform, opacity;
}
@media (min-width: 1024px) {
  .model-wrap {
    width: min(100%, calc(100svh - var(--nav-h) - 9rem));
  }
}
.model {
  touch-action: pan-y;
}
.model.is-interactive {
  cursor: grab;
}
.model.is-interactive:active {
  cursor: grabbing;
}

.chip {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: var(--radius-pill);
  /* Sin backdrop-filter: las órbitas giran detrás y obligarían a recalcular el desenfoque en cada fotograma */
  background: rgb(255 255 255 / 0.9);
  box-shadow: var(--shadow-soft);
  padding: 0.45rem 0.9rem;
  font-size: 0.8125rem;
}
.chip-layer {
  top: 10%;
  right: 2%;
}
.chip-points {
  left: 6%;
  bottom: 14%;
  gap: 0.5rem;
  padding: 0.7rem 0.8rem;
}
.pulse {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--color-cyan);
  animation: pulse 2.4s var(--ease-in-out-soft) infinite;
  animation-delay: var(--d);
}
@keyframes pulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

.controls {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
.layer-group {
  display: flex;
  gap: 0.375rem;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 0.25rem;
  margin: -0.25rem;
}
.layer-btn {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
  background: rgb(255 255 255 / 0.7);
  padding-inline: 0.9rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-deep-blue);
  transition:
    background-color var(--dur-fast) var(--ease-out-soft),
    border-color var(--dur-fast) var(--ease-out-soft),
    color var(--dur-fast) var(--ease-out-soft);
}
.layer-btn:hover {
  border-color: var(--color-primary);
}
.layer-btn[aria-pressed='true'] {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-white);
}
.rotate-btn {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: rgb(255 255 255 / 0.7);
  color: var(--color-deep-blue);
}
.rotate-btn:hover {
  border-color: var(--color-primary);
}

/* Solo con el pin (≥ 1024 px). El CSS con ámbito no va en una capa: ganaría a `hidden`/`lg:block`. */
.sequence-text {
  display: none;
}
@media (min-width: 1024px) {
  .sequence-text {
    display: grid;
    min-height: 4.5em;
  }
}
.sequence-line {
  grid-area: 1 / 1;
  max-width: 26ch;
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity var(--dur-base) var(--ease-out-soft),
    transform var(--dur-base) var(--ease-out-soft);
}
.sequence-line.is-on {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .pulse {
    animation: none;
    opacity: 0.8;
  }
  .sequence-line {
    transition: none;
  }
}
</style>
