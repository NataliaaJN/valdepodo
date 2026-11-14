<script setup lang="ts">
/**
 * Hero de la Home. Referencia de sensación: heroes etéreos de pieza 3D luminosa a pantalla completa con
 * texto sobrio a la izquierda y mucho aire (Mind AI, Mind-Body Healing).
 *
 * Solo dos textos, FIJOS (no se mueven con el scroll): eyebrow «Clínica de podología · Valdemoro» y el
 * titular «Todo empieza por tus pies» con «tus pies» en otro color. Lo único que responde al scroll es el
 * pie 3D (capa de músculos bajo contorno translúcido), que da un paso: el progreso de la sección fijada
 * (0 → 1) gobierna el ciclo talón → apoyo → antepié → impulso (app/utils/foot-step.ts).
 *
 * - ≥ 1024 px y nivel `full`: sección fijada (~220 %); el texto queda quieto y el pie recorre el paso.
 * - Tablet, móvil o `lite`: también fijada, con un recorrido más corto.
 * - `static` (incluye reduced motion): póster estático.
 */
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { site } from '~/data/site'
import { hero } from '~/data/home'
/** Casi de perfil (3/4 abierto): la puntera apunta a la izquierda y algo hacia la cámara */
const HERO_ROTATION_Y = 0.25

const section = ref<HTMLElement | null>(null)
const { tier } = useDeviceTier()

const progress = ref(0)
const sceneReady = ref(false)


const poster = computed(
  () => '/images/3d-fallbacks/foot/muscles',
)

const loader = () => import('~/components/three/FootAnatomy.client.vue')
const sceneProps = computed(() => ({
  activeLayer: 'muscles',
  rotationY: HERO_ROTATION_Y,
  step: progress.value,
  studio: true,
  // De perfil el pie ocupa más ancho que de frente: se reduce un poco para que quepa entero
  fit: 2.3,
}))

useGsapContext(section, (c) => {
  progress.value = 0
  if (c.reduce || tier.value === 'static') return undefined
  // El scroll controla el progreso del paso de forma continua (sin animación independiente)
  ScrollTrigger.create({
    trigger: section.value,
    start: 'top top',
    end: c.desktop && tier.value === 'full' ? '+=220%' : '+=160%',
    pin: true,
    scrub: 0.6,
    onUpdate: (self) => (progress.value = self.progress),
  })
  return undefined
})
</script>

<template>
  <section ref="section" class="hero section-clip relative isolate" data-nav-theme="bone" aria-labelledby="hero-title">
    <div class="hero__model" aria-hidden="true">
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

    <!-- Indicador de scroll: ratón con rueda que se desliza, muy sutil; se desvanece en cuanto empieza el paso -->
    <div class="hero__scroll" :style="{ opacity: Math.max(0, 1 - progress * 10) }" aria-hidden="true">
      <span class="hero__mouse"><span class="hero__wheel" /></span>
      <span class="hero__chevron" />
    </div>

    <div class="hero__text container-wide">
      <p class="eyebrow hero__eyebrow">Clínica de podología · <ContentValue :value="site.city" /></p>
      <h1 id="hero-title" class="hero__title">Valdepodo</h1>
      <p class="hero__lead">
        {{ hero.title.before }}<em class="hero__accent">{{ hero.title.accent }}</em>
      </p>
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
  /* Hueso plano: el pie 3D es la única pieza de color */
  background: var(--color-bone);
}

/* ---------- Pie ---------- */
.hero__model {
  position: absolute;
  z-index: 1;
  top: calc(var(--nav-h) + 1rem);
  left: 50%;
  width: min(120vw, 34rem);
  translate: -50% 0;
  filter: drop-shadow(0 30px 36px rgb(6 26 44 / 0.22));
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
.hero__fade {
  -webkit-mask-image: linear-gradient(to bottom, transparent 14%, #000 46%);
  mask-image: linear-gradient(to bottom, transparent 14%, #000 46%);
}

/* ---------- Indicador de scroll ---------- */
.hero__scroll {
  position: absolute;
  z-index: 2;
  right: clamp(1.25rem, 3.5vw, 3.5rem);
  bottom: clamp(1.75rem, 7svh, 4rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  pointer-events: none;
  transition: opacity 0.3s linear;
  animation: fade-up 1.4s var(--ease-out-soft) both;
  animation-delay: 1s;
}
html[data-intro='play'] .hero__scroll {
  animation-delay: 2s;
}
.hero__mouse {
  display: block;
  position: relative;
  width: 2rem;
  height: 3.25rem;
  border: 2px solid var(--color-ink);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.4);
  box-shadow: 0 6px 18px rgb(18 112 182 / 0.22);
}
.hero__wheel {
  position: absolute;
  top: 0.65rem;
  left: 50%;
  width: 4px;
  height: 0.75rem;
  margin-left: -2px;
  border-radius: 2px;
  background: var(--color-primary);
  animation: wheel 1.8s cubic-bezier(0.5, 0, 0.2, 1) infinite;
}
.hero__chevron {
  width: 0.7rem;
  height: 0.7rem;
  border-right: 2px solid var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
  rotate: 45deg;
  animation: chevron 1.8s ease-in-out infinite;
}
@keyframes wheel {
  0% {
    opacity: 0;
    transform: translateY(-3px);
  }
  25% {
    opacity: 1;
  }
  75%,
  100% {
    opacity: 0;
    transform: translateY(1rem);
  }
}
@keyframes chevron {
  0%,
  100% {
    opacity: 0.25;
    translate: 0 -2px;
  }
  50% {
    opacity: 1;
    translate: 0 3px;
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
  color: rgb(6 26 44 / 0.7);
  animation: fade-up 1.2s var(--ease-out-soft) both;
  animation-delay: 0.2s;
}
.hero__title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(3rem, 0.9rem + 8.6vw, 8.5rem);
  line-height: 0.92;
  letter-spacing: -0.04em;
  animation: fade-up 1.4s var(--ease-out-soft) both;
  animation-delay: 0.35s;
}
.hero__lead {
  max-width: 16ch;
  margin-top: clamp(0.75rem, 1.6vw, 1.25rem);
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(1.375rem, 1rem + 1.6vw, 2.25rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  text-wrap: balance;
  animation: fade-up 1.4s var(--ease-out-soft) both;
  animation-delay: 0.5s;
}
.hero__accent {
  font-style: normal;
  font-weight: 600;
  color: var(--color-primary-strong);
}
html[data-intro='play'] .hero__eyebrow {
  animation-delay: 1.3s;
}
html[data-intro='play'] .hero__title {
  animation-delay: 1.45s;
}
html[data-intro='play'] .hero__lead {
  animation-delay: 1.6s;
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
    right: 11vw;
    width: min(56vw, 88svh);
    translate: 0 -48%;
  }
  .hero__text {
    padding-bottom: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__wheel,
  .hero__chevron {
    animation: none;
    opacity: 1;
  }
  .hero__scroll,
  .hero__model,
  .hero__eyebrow,
  .hero__lead,
  .hero__title {
    animation: none;
  }
}
</style>
