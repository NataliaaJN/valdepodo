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
  <section ref="section" class="hero section-clip relative isolate" data-nav-theme="blue" aria-labelledby="hero-title">
    <!-- Luz ambiental: halo cian tras el pie y velo de luz arriba a la izquierda -->
    <div class="hero__glow" aria-hidden="true" />

    <div class="hero__model" aria-hidden="true">
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
  color: var(--color-bone);
  background:
    radial-gradient(120% 80% at 82% 38%, #2f9fe0 0%, rgb(47 159 224 / 0) 60%),
    radial-gradient(70% 60% at 8% 8%, rgb(191 216 234 / 0.35) 0%, rgb(191 216 234 / 0) 70%),
    linear-gradient(160deg, #0f5f9f 0%, #1270b6 45%, #0a4d82 100%);
}
.hero__glow {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(38% 46% at 74% 46%, rgb(160 228 250 / 0.38), rgb(160 228 250 / 0) 70%);
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

/* ---------- Texto (fijo) ---------- */
.hero__text {
  position: relative;
  z-index: 2;
  padding-bottom: clamp(2rem, 8svh, 5rem);
}
.hero__eyebrow {
  margin-bottom: 1rem;
  color: rgb(241 239 233 / 0.85);
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
  color: #8fe3ff;
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
    right: -4vw;
    width: min(62vw, 92svh);
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
