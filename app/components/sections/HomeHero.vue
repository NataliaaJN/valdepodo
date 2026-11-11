<script setup lang="ts">
/**
 * Hero de la Home. Referencia de sensación: heroes etéreos de pieza 3D luminosa a pantalla completa con
 * texto sobrio a la izquierda y mucho aire (Mind AI, Mind-Body Healing).
 *
 * Solo dos textos, FIJOS (no se mueven con el scroll): eyebrow «Clínica de podología · Valdemoro» y el
 * titular «Todo empieza por tus pies» con «tus pies» en otro color. Lo único que responde al scroll es el
 * pie 3D, que gira y pasa de piel a músculos y huesos.
 *
 * - ≥ 1024 px y nivel `full`: sección fijada (~220 %); el texto queda quieto y el pie recorre la secuencia.
 * - Tablet o `lite`: sin fijado; rotación corta con el propio scroll.
 * - Móvil / `static` (incluye reduced motion): póster estático.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { site } from '~/data/site'
import { HERO_EXIT_START, hero, heroRotationAt, heroSequence, heroStepIndex } from '~/data/home'
import type { FootLayer } from '~/utils/foot-layers'

const section = ref<HTMLElement | null>(null)
const { tier, resolved } = useDeviceTier()

const progress = ref(0)
const sceneReady = ref(false)

const step = computed(() => heroSequence[heroStepIndex(progress.value)]!)
const activeLayer = computed<FootLayer>(() => step.value.layer)
const userRotation = reactive({ value: 0 })
const MAX_USER_ROTATION = Math.PI / 3 // ±60°
const rotationY = computed(() => heroRotationAt(progress.value) + userRotation.value)

/*
 * «Da el paso»: con el scroll el pie avanza hacia la izquierda y, en el tramo final, se acerca al espectador
 * y se funde.
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

const isStatic = computed(() => !resolved.value || tier.value === 'static')
const poster = computed(
  () => `/images/3d-fallbacks/foot/${isStatic.value || !sceneReady.value ? activeLayer.value : 'skin'}`,
)

/* Rotación manual: arrastre horizontal (pan-y deja pasar el scroll); en ratón vuelve a la secuencia al soltar */
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
  if (e.pointerType === 'mouse') {
    dragTween = gsap.to(userRotation, { value: 0, duration: 0.9, ease: 'power3.out' })
  }
}
onBeforeUnmount(() => dragTween?.kill())

const loader = () => import('~/components/three/FootAnatomy.client.vue')
const sceneProps = computed(() => ({
  activeLayer: activeLayer.value,
  rotationY: rotationY.value,
  studio: true,
}))

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
</script>

<template>
  <section ref="section" class="hero section-clip relative isolate" data-nav-theme="bone" aria-labelledby="hero-title">
    <!-- Luz ambiental: halo cian tras el pie y velo de luz arriba a la izquierda -->
    <div class="hero__glow" aria-hidden="true" />

    <div
      class="hero__model"
      :class="{ 'is-interactive': !isStatic }"
      :style="modelStyle"
      aria-hidden="true"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <div class="hero__fade">
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
      </div>
    </div>

    <div class="hero__text container-wide">
      <p class="eyebrow hero__eyebrow">Clínica de podología · <ContentValue :value="site.city" /></p>
      <h1 id="hero-title" class="hero__title">
        {{ hero.title.before }}<em class="hero__accent">{{ hero.title.accent }}</em>
      </h1>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  align-items: end;
  min-height: max(100svh, 40rem);
  padding-top: var(--nav-h);
  color: var(--color-ink);
  /* Cian clarito, etéreo: velo de luz tras el pie y un poco más de cian abajo */
  background:
    radial-gradient(50% 60% at 74% 50%, rgb(255 255 255 / 0.6), rgb(255 255 255 / 0) 70%),
    linear-gradient(180deg, #e3f6fc 0%, #cdeefa 100%);
}
.hero__glow {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(40% 48% at 74% 46%, rgb(255 255 255 / 0.55), rgb(255 255 255 / 0) 70%);
  animation: glow-in 2.4s var(--ease-out-soft) both;
}
@keyframes glow-in {
  from {
    opacity: 0;
  }
}

/* ---------- Pie ---------- */
.hero__model {
  position: absolute;
  z-index: 1;
  top: calc(var(--nav-h) + 1rem);
  left: 50%;
  width: min(120vw, 34rem);
  translate: -50% 0;
  filter: drop-shadow(0 30px 36px rgb(18 112 182 / 0.3));
  animation: model-in 1.8s var(--ease-out-soft) both;
  animation-delay: 0.3s;
}
html[data-intro='play'] .hero__model {
  animation-delay: 1.4s;
}
@keyframes model-in {
  from {
    opacity: 0;
    transform: translateY(6%) scale(0.97);
  }
}

/* Degradado superior: el corte del tobillo se funde con el fondo. La máscara va en la capa interior para no recortar la sombra */
.hero__model {
  touch-action: pan-y;
  will-change: transform, opacity;
}
.hero__model.is-interactive {
  cursor: grab;
}
.hero__model.is-interactive:active {
  cursor: grabbing;
}
.hero__fade {
  -webkit-mask-image: linear-gradient(to bottom, transparent 14%, #000 46%);
  mask-image: linear-gradient(to bottom, transparent 14%, #000 46%);
}
/* Póster estático (móvil / carga): el render gris de origen se lleva al tono de piel de la escena 3D */
.hero__fade :deep(img) {
  filter: sepia(0.3) saturate(1.05) hue-rotate(-18deg) brightness(0.97) contrast(1.02);
}

/* ---------- Texto (fijo) ---------- */
.hero__text {
  position: relative;
  z-index: 2;
  padding-bottom: clamp(2rem, 8svh, 5rem);
}
.hero__eyebrow {
  margin-bottom: 1rem;
  color: rgb(6 26 44 / 0.7);
  animation: fade-up 1.2s var(--ease-out-soft) both;
  animation-delay: 0.2s;
}
.hero__title {
  max-width: 9.5ch;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(3rem, 1.2rem + 7.2vw, 7.5rem);
  line-height: 0.96;
  letter-spacing: -0.035em;
  text-wrap: balance;
  animation: fade-up 1.4s var(--ease-out-soft) both;
  animation-delay: 0.35s;
}
.hero__accent {
  font-style: normal;
  font-weight: 600;
  color: var(--color-primary);
}
html[data-intro='play'] .hero__eyebrow {
  animation-delay: 1.3s;
}
html[data-intro='play'] .hero__title {
  animation-delay: 1.45s;
}
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
}

@media (min-width: 768px) {
  .hero {
    align-items: center;
  }
  .hero__model {
    top: 50%;
    left: auto;
    right: 7vw;
    width: min(56vw, 88svh);
    translate: 0 -48%;
  }
  .hero__text {
    padding-bottom: 0;
  }
  .hero__title {
    max-width: 8.5ch;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__model,
  .hero__glow,
  .hero__eyebrow,
  .hero__title {
    animation: none;
  }
}
</style>
