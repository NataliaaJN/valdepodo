<script setup lang="ts">
/**
 * Hero de la Home. Composición editorial sobre el azul Valdepodo: «Da el próximo paso.» monumental en tres
 * líneas escalonadas y el pie 3D PISANDO el claim: el canvas es transparente y queda entre dos copias del
 * texto (la de atrás con todas las líneas y la de delante solo con «paso.»), de modo que el pie pasa por
 * delante de «próximo» y por detrás de «paso.».
 *
 * - ≥ 1024 px y nivel `full`: sección fijada (~220 %). El scroll recorre piel → músculos → huesos mientras el pie
 *   gira y, al final, «da el paso»: se acerca al espectador y se funde.
 * - Tablet o `lite`: sin fijado; rotación corta con el propio scroll.
 * - Móvil: composición apilada (claim, pie debajo); el modelo responde al arrastre y al selector de capa.
 * - `static` (incluye reduced motion): pósters por capa, mismos controles.
 * El estado es declarativo (capa, rotación): ScrollTrigger y los controles solo cambian refs (spec 08 §1.4).
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { site } from '~/data/site'
import { HERO_EXIT_START, hero, heroLayers, heroRotationAt, heroSequence, heroStepIndex } from '~/data/home'
import { FOOT_LAYER_LABELS, type FootLayer } from '~/utils/foot-layers'

const section = ref<HTMLElement | null>(null)
const { tier, resolved } = useDeviceTier()

const claim = ['Da el', 'próximo', 'paso.'] as const

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
const MAX_USER_ROTATION = Math.PI / 3 // ±60°
const rotationY = computed(() => heroRotationAt(progress.value) + userRotation.value)

/*
 * «Da el paso»: con el scroll el pie avanza hacia el claim (los dedos pasan por detrás de «paso.», que está
 * en la capa delantera) y, en el tramo final, se acerca al espectador y se funde.
 */
const exit = computed(() => {
  const t = Math.min(1, Math.max(0, (progress.value - HERO_EXIT_START) / (1 - HERO_EXIT_START)))
  return t * t * (3 - 2 * t)
})
const modelStyle = computed(() => {
  const walk = progress.value * -16 // % de su propio ancho, hacia la izquierda
  if (progress.value <= 0) return undefined
  return {
    transform: `translate3d(${walk + exit.value * 8}%, ${exit.value * 10}%, 0) scale(${1 + exit.value * 0.5})`,
    opacity: String(1 - exit.value),
  }
})
const stageStyle = computed(() => ({ '--p': progress.value.toFixed(4) }))

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
  // Escritorio: vuelve suavemente a la orientación de la secuencia al soltar
  if (e.pointerType === 'mouse') {
    dragTween = gsap.to(userRotation, { value: 0, duration: 0.9, ease: 'power3.out' })
  }
}
function rotate(delta: number) {
  dragTween?.kill()
  userRotation.value = clampRotation(userRotation.value + delta)
}

/* ----- Secuencia de scroll ----- */
useGsapContext(section, (c) => {
  progress.value = 0
  if (c.reduce || c.mobile || tier.value === 'static') return undefined
  if (c.desktop && tier.value === 'full') {
    ScrollTrigger.create({
      trigger: section.value,
      start: 'top top',
      end: '+=220%',
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
</script>

<template>
  <section
    ref="section"
    class="hero chapter-blue section-clip relative isolate"
    data-nav-theme="blue"
    aria-labelledby="hero-title"
  >
    <div class="hero__stage" :style="stageStyle">
      <!-- Claim: capa trasera (todas las líneas, lectura accesible) y capa delantera (solo «paso.») -->
      <h1 id="hero-title" class="claim-layer claim-layer--back" aria-label="Da el próximo paso.">
        <span
          v-for="(text, i) in claim"
          :key="text"
          class="line mega"
          :class="`line--${i + 1}`"
          aria-hidden="true"
        >
          <span class="line__in" :style="{ '--i': i }">{{ text }}</span>
        </span>
      </h1>

      <div class="hero__model" :style="modelStyle">
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
            poster-sizes="(min-width: 1024px) 70vw, 100vw"
            aspect-ratio="1 / 1"
            priority
            @ready="sceneReady = true"
          />
        </figure>
      </div>

      <div class="claim-layer claim-layer--front" aria-hidden="true">
        <span
          v-for="(text, i) in claim"
          :key="text"
          class="line mega"
          :class="[`line--${i + 1}`, { 'is-hidden': i !== 2 }]"
        >
          <span class="line__in" :style="{ '--i': i }">{{ text }}</span>
        </span>
      </div>
    </div>

    <!-- Barra inferior: contexto + una sola acción · frase de la secuencia · selector de capa -->
    <div class="hero__bar container-wide">
      <div class="bar-start">
        <p class="eyebrow">Clínica de podología · <ContentValue :value="site.city" /></p>
        <BaseButton variant="on-blue" :to="hero.primaryCta.to" arrow>{{ hero.primaryCta.label }}</BaseButton>
      </div>

      <!-- Frases de la secuencia (solo con el fijado, ≥ 1024 px) -->
      <div class="hero__caption" aria-hidden="true">
        <template v-for="(s, i) in heroSequence" :key="i">
          <ContentValue
            v-if="s.text"
            :value="s.text"
            as="p"
            class="caption-line"
            :class="{ 'is-on': i === stepIndex && progress > 0.02 }"
          />
        </template>
      </div>

      <div class="bar-end">
        <div class="layers" role="group" aria-label="Capa del modelo">
          <button
            v-for="(layer, i) in layers"
            :key="layer"
            type="button"
            class="layer"
            :aria-pressed="activeLayer === layer"
            @click="selectLayer(layer)"
          >
            <span class="layer__n">0{{ i + 1 }}</span
            >{{ FOOT_LAYER_LABELS[layer] }}
          </button>
          <span v-if="!isStatic" class="rot">
            <button
              type="button"
              class="rot__btn"
              aria-label="Girar el modelo a la izquierda"
              @click="rotate(-0.4)"
            >
              <BaseIcon name="arrow-left" class="size-4" />
            </button>
            <button
              type="button"
              class="rot__btn"
              aria-label="Girar el modelo a la derecha"
              @click="rotate(0.4)"
            >
              <BaseIcon name="arrow-right" class="size-4" />
            </button>
          </span>
        </div>
        <p class="credit">
          <PendingBadge
            label="Modelo provisional"
            note="Prototipo de la Fase 2: pendiente de la revisión anatómica de la podóloga (Gate 2)"
          />
          Modelo basado en BodyParts3D, © DBCLS,
          <a href="https://creativecommons.org/licenses/by/4.0/deed.es" rel="license noopener" target="_blank"
            >CC BY 4.0</a
          >
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  min-height: max(100svh, 40rem);
}

/* ---------- Escenario ---------- */
.hero__stage {
  position: relative;
  min-height: 0;
  padding-top: var(--nav-h);
}

.claim-layer {
  display: flex;
  flex-direction: column;
  padding-inline: var(--gutter);
  /* Móvil: el claim ocupa todo el ancho. Desde 768 px la altura del viewport limita el tamaño: caben tres líneas */
  --claim-size: min(33vw, 15svh + 12vw);
  padding-top: 0.5rem;
}
.line--2 {
  margin-left: 8vw;
}
.line--3 {
  margin-left: 2vw;
}
.line {
  display: block;
  overflow: hidden;
  padding-block: 0.14em 0.2em;
  margin-block: -0.14em -0.2em;
  font-size: var(--claim-size);
  line-height: 0.84;
  width: fit-content;
}
.line__in {
  display: block;
  animation: line-up 1.4s var(--ease-out-soft) both;
  animation-delay: calc(0.15s + var(--i) * 0.12s);
}
html[data-intro='play'] .line__in {
  animation-delay: calc(1.25s + var(--i) * 0.12s);
}
.line.is-hidden {
  visibility: hidden;
}
@keyframes line-up {
  from {
    transform: translateY(112%);
  }
}

/* ---------- Pie ---------- */
.hero__model {
  position: relative;
  z-index: 2;
  width: min(104%, 46rem);
  margin: -3.5rem auto 0;
  will-change: transform, opacity;
  animation: model-in 1.6s var(--ease-out-soft) both;
  animation-delay: 0.4s;
}
html[data-intro='play'] .hero__model {
  animation-delay: 1.45s;
}
@keyframes model-in {
  from {
    opacity: 0;
    transform: translateY(8%) scale(0.96);
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

.claim-layer--front {
  display: none;
}
.hero__caption {
  display: none;
}

/* ---------- Barra ---------- */
.hero__bar {
  position: relative;
  z-index: 4;
  display: grid;
  gap: 1.25rem;
  padding-block: 0.5rem 1.5rem;
}
.bar-start {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.5rem;
}
.bar-end {
  display: grid;
  gap: 0.75rem;
}
.layers {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 1.25rem;
}
.layer {
  display: inline-flex;
  align-items: baseline;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding-inline: 0;
  font-size: 0.9375rem;
  font-weight: 500;
  color: rgb(241 239 233 / 0.62);
  border-bottom: 1px solid transparent;
  transition:
    color var(--dur-base) var(--ease-out-soft),
    border-color var(--dur-base) var(--ease-out-soft);
}
.layer__n {
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
}
.layer[aria-pressed='true'] {
  color: var(--color-bone);
  border-bottom-color: var(--color-bone);
}
@media (hover: hover) and (pointer: fine) {
  .layer:hover {
    color: var(--color-bone);
  }
}
.rot {
  display: inline-flex;
  gap: 0.25rem;
  margin-left: auto;
}
.rot__btn {
  display: inline-grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid rgb(241 239 233 / 0.4);
  border-radius: var(--radius-m);
  color: var(--color-bone);
  transition:
    background-color var(--dur-base) var(--ease-out-soft),
    color var(--dur-base) var(--ease-out-soft);
}
@media (hover: hover) and (pointer: fine) {
  .rot__btn:hover {
    background: var(--color-bone);
    color: var(--color-ink);
  }
}
.credit {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.75rem;
  font-size: 0.75rem;
  color: rgb(241 239 233 / 0.7);
}
.credit a {
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* ---------- Tablet y escritorio: el pie pisa el claim ---------- */
@media (min-width: 768px) {
  .hero__stage {
    display: block;
  }
  .claim-layer {
    --claim-size: min(var(--text-mega), 24svh);
    padding-top: 0;
    position: absolute;
    inset: var(--nav-h) 0 0;
    justify-content: center;
    padding-bottom: 1rem;
  }
  .claim-layer--back {
    z-index: 1;
  }
  .claim-layer--front {
    display: flex;
    z-index: 3;
    pointer-events: none;
  }
  .line--1 {
    margin-left: 0;
  }
  .line--2 {
    margin-left: clamp(2rem, 14vw, 22rem);
  }
  .line--3 {
    margin-left: clamp(0.5rem, 3vw, 6rem);
  }
  .line--1 .line__in {
    translate: calc(var(--p, 0) * -5vw) 0;
  }
  .line--3 .line__in {
    translate: calc(var(--p, 0) * 9vw) 0;
  }
  .hero__model {
    position: absolute;
    top: 50%;
    right: -3vw;
    width: min(66vw, 92svh);
    margin: 0;
    translate: 0 -46%;
  }
  .hero__bar {
    grid-template-columns: auto minmax(0, 1fr);
    align-items: end;
    justify-content: space-between;
    column-gap: 3rem;
  }
  .bar-end {
    justify-items: end;
  }
}

@media (min-width: 1024px) {
  .hero__bar {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }
  .hero__caption {
    display: grid;
    align-self: center;
    justify-self: start;
    min-height: 3.5em;
    margin-left: clamp(1rem, 4vw, 5rem);
  }
  .caption-line {
    grid-area: 1 / 1;
    max-width: 26ch;
    font-family: var(--font-display);
    font-weight: 500;
    font-size: var(--text-heading-s);
    line-height: 1.1;
    letter-spacing: -0.02em;
    opacity: 0;
    transform: translateY(10px);
    transition:
      opacity var(--dur-base) var(--ease-out-soft),
      transform var(--dur-base) var(--ease-out-soft);
  }
  .caption-line.is-on {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .line__in,
  .hero__model {
    animation: none;
  }
  .caption-line {
    transition: none;
  }
}
</style>
