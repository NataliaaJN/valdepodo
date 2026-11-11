<script setup lang="ts">
/**
 * Hero de la Home. Composición a dos columnas (texto a la izquierda, pie 3D a la derecha) sobre una atmósfera
 * azul muy clara con halo de luz. Solo dos textos, FIJOS con el scroll: eyebrow y titular. Lo único que
 * responde al scroll es el pie, que gira y pasa de piel a músculos y huesos; además tiene un paralaje muy
 * ligero con el puntero (solo escritorio, sin reduced motion).
 *
 * - ≥ 1024 px y nivel `full`: sección fijada (~220 %).
 * - Tablet o `lite`: sin fijado; rotación corta con el propio scroll.
 * - Móvil / `static` (incluye reduced motion): póster estático.
 */
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
const rotationY = computed(() => heroRotationAt(progress.value))

const isStatic = computed(() => !resolved.value || tier.value === 'static')
const poster = computed(
  () => `/images/3d-fallbacks/foot/${isStatic.value || !sceneReady.value ? activeLayer.value : 'skin'}`,
)

const loader = () => import('~/components/three/FootAnatomy.client.vue')
const sceneProps = computed(() => ({
  activeLayer: activeLayer.value,
  rotationY: rotationY.value,
  studio: true,
}))

/* Paralaje ligero con el puntero: lerp lento sobre variables CSS (no re-renderiza Vue) */
onMounted(() => {
  const el = section.value
  if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  let tx = 0
  let ty = 0
  let x = 0
  let y = 0
  let raf = 0
  const tick = () => {
    x += (tx - x) * 0.05
    y += (ty - y) * 0.05
    el.style.setProperty('--mx', x.toFixed(3))
    el.style.setProperty('--my', y.toFixed(3))
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.002 ? requestAnimationFrame(tick) : 0
  }
  const onMove = (e: PointerEvent) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 2
    ty = (e.clientY / window.innerHeight - 0.5) * 2
    if (!raf) raf = requestAnimationFrame(tick)
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  onBeforeUnmount(() => {
    window.removeEventListener('pointermove', onMove)
    cancelAnimationFrame(raf)
  })
})

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
  <section
    ref="section"
    class="hero section-clip relative isolate"
    data-nav-theme="bone"
    aria-labelledby="hero-title"
  >
    <!-- Atmósfera: halo de luz tras el pie + curvas plantares muy sutiles -->
    <div class="hero__halo" aria-hidden="true" />
    <svg class="hero__contours" viewBox="0 0 600 600" fill="none" aria-hidden="true">
      <path
        d="M300 40c120 0 214 84 230 200 14 104-46 190-122 262-70 66-196 66-262 0C84 436 52 338 90 232 126 130 200 40 300 40Z"
      />
      <path
        d="M300 92c92 0 164 64 176 152 10 80-34 146-92 200-54 50-150 50-200 0-54-54-78-128-50-208 28-80 86-144 166-144Z"
      />
      <path
        d="M300 146c66 0 118 46 126 108 8 58-24 106-66 146-38 36-108 36-144 0-40-40-56-92-36-150 20-58 62-104 120-104Z"
      />
      <path
        d="M300 200c42 0 74 28 80 66 6 36-14 66-40 92-24 24-68 24-92 0-26-26-36-58-24-94 12-36 40-64 76-64Z"
      />
    </svg>

    <div class="hero__model" aria-hidden="true">
      <div class="hero__parallax">
        <span class="hero__ground" />
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
    </div>

    <div class="hero__text container-wide">
      <p class="eyebrow hero__eyebrow">Clínica de podología · <ContentValue :value="site.city" /></p>
      <h1 id="hero-title" class="hero__title">
        {{ hero.title.before }}<em class="hero__accent">{{ hero.title.accent }}</em>
      </h1>
    </div>

    <span class="hero__scroll" aria-hidden="true"><span class="hero__scroll-dot" /></span>
  </section>
</template>

<style scoped>
.hero {
  --h-blue: #087ead;
  --h-deep: #163c63;
  --h-pale: #eaf5fa;
  --h-mist: #f5f8fc;
  --h-text: #24364b;
  --mx: 0;
  --my: 0;
  display: grid;
  align-items: end;
  min-height: max(100svh, 40rem);
  padding-top: var(--nav-h);
  color: var(--h-text);
  /* Base azul muy clara con luz ambiental: más clara arriba-izquierda, más hielo abajo-derecha */
  background:
    radial-gradient(70% 60% at 12% 0%, rgb(255 255 255 / 0.85), rgb(255 255 255 / 0) 70%),
    radial-gradient(60% 55% at 92% 100%, rgb(185 229 243 / 0.75), rgb(185 229 243 / 0) 70%),
    radial-gradient(40% 40% at 70% 20%, rgb(0 169 208 / 0.08), rgb(0 169 208 / 0) 70%),
    linear-gradient(170deg, var(--h-mist) 0%, var(--h-pale) 55%, #dcf0f8 100%);
}
.hero__halo {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(34% 44% at 70% 46%, rgb(255 255 255 / 0.95), rgb(255 255 255 / 0) 72%),
    radial-gradient(52% 62% at 70% 50%, rgb(185 229 243 / 0.55), rgb(185 229 243 / 0) 74%);
  animation:
    halo-in 2.4s var(--ease-out-soft) both,
    halo-breathe 14s ease-in-out 2.4s infinite alternate;
}
@keyframes halo-in {
  from {
    opacity: 0;
  }
}
@keyframes halo-breathe {
  to {
    transform: scale(1.04);
    opacity: 0.9;
  }
}

/* Curvas plantares: contornos concéntricos casi invisibles tras el pie */
.hero__contours {
  position: absolute;
  z-index: 0;
  top: 50%;
  right: 4vw;
  width: min(64vw, 96svh);
  translate: 0 -50%;
  rotate: -18deg;
  stroke: var(--h-blue);
  stroke-width: 1;
  opacity: 0.1;
  pointer-events: none;
  animation: contours-drift 40s ease-in-out infinite alternate;
}
@keyframes contours-drift {
  to {
    rotate: -12deg;
    scale: 1.03;
  }
}

/* ---------- Pie ---------- */
.hero__model {
  position: absolute;
  z-index: 1;
  top: calc(var(--nav-h) + 0.5rem);
  left: 50%;
  width: min(120vw, 34rem);
  translate: -50% 0;
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
.hero__parallax {
  position: relative;
  transform: translate3d(calc(var(--mx) * -10px), calc(var(--my) * -7px), 0);
}
/* Sombra de suelo: elipse difusa azul profundo bajo el pie (nada de filtros sobre el modelo) */
.hero__ground {
  position: absolute;
  left: 14%;
  right: 8%;
  bottom: 10%;
  height: 11%;
  border-radius: 50%;
  background: radial-gradient(closest-side, rgb(22 60 99 / 0.28), rgb(22 60 99 / 0) 100%);
  filter: blur(14px);
}
/* Degradado superior: el corte del tobillo se funde con el fondo */
.hero__fade {
  position: relative;
  -webkit-mask-image: linear-gradient(to bottom, transparent 12%, #000 44%);
  mask-image: linear-gradient(to bottom, transparent 12%, #000 44%);
}

/* Póster estático (móvil / carga): el render gris de origen se lleva al tono de piel de la escena 3D */
.hero__fade :deep(img) {
  filter: sepia(0.3) saturate(1.05) hue-rotate(-18deg) brightness(0.97) contrast(1.02);
}

/* ---------- Texto (fijo) ---------- */
.hero__text {
  position: relative;
  z-index: 2;
  padding-inline: var(--gutter);
  padding-bottom: clamp(3rem, 12svh, 7rem);
}
.hero__eyebrow {
  margin-bottom: 1.1rem;
  color: color-mix(in srgb, var(--h-text) 72%, transparent);
  letter-spacing: 0.16em;
  animation: fade-up 1.2s var(--ease-out-soft) both;
  animation-delay: 0.2s;
}
.hero__title {
  max-width: 10ch;
  font-family: 'Manrope Variable', var(--font-sans);
  font-weight: 600;
  font-size: clamp(2.6rem, 1.1rem + 5vw, 5.5rem);
  line-height: 1.04;
  letter-spacing: -0.045em;
  text-wrap: balance;
  color: var(--h-text);
  animation: fade-up 1.4s var(--ease-out-soft) both;
  animation-delay: 0.35s;
}
.hero__accent {
  font-style: normal;
  font-weight: 600;
  color: var(--h-blue);
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

/* ---------- Indicador de scroll: hilo fino con un punto de luz ---------- */
.hero__scroll {
  position: absolute;
  z-index: 2;
  left: 50%;
  bottom: 1.5rem;
  width: 1px;
  height: 3.25rem;
  overflow: hidden;
  background: color-mix(in srgb, var(--h-deep) 18%, transparent);
  animation: fade-up 1.4s var(--ease-out-soft) 1.2s both;
}
.hero__scroll-dot {
  display: block;
  width: 100%;
  height: 40%;
  background: var(--h-blue);
  animation: scroll-run 2.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}
@keyframes scroll-run {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(250%);
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
    max-width: 9ch;
  }
  .hero__scroll {
    left: var(--gutter);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__model,
  .hero__halo,
  .hero__contours,
  .hero__eyebrow,
  .hero__title,
  .hero__scroll,
  .hero__scroll-dot {
    animation: none;
  }
  .hero__parallax {
    transform: none;
  }
}
</style>
