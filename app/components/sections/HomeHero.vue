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

const POSTER = '/images/3d-fallbacks/foot/muscles'
/** Anchura real del póster en cada diseño: apilado (móvil/tablet vertical) o lado a lado (≥ 768 px apaisado) */
const POSTER_SIZES = '(min-width: 768px) and (min-aspect-ratio: 1/1) 56vw, (min-width: 768px) 100vw, 100vw'
const poster = POSTER

// El póster es el LCP del sitio: se pide desde el <head>, en paralelo al JS, en vez de esperar al HTML del hero.
// `type` evita descargarlo en navegadores sin AVIF (el <picture> cae a WebP por su cuenta).
useHead({
  link: [
    {
      key: 'hero-poster',
      rel: 'preload',
      as: 'image',
      type: 'image/avif',
      href: `${publicUrl(POSTER)}.avif`,
      imagesrcset: `${publicUrl(POSTER)}-800.avif 800w, ${publicUrl(POSTER)}.avif 1600w`,
      imagesizes: POSTER_SIZES,
      fetchpriority: 'high',
    },
  ],
})

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
  <section
    ref="section"
    class="hero section-clip relative isolate"
    data-nav-theme="bone"
    aria-labelledby="hero-title"
  >
    <div class="hero__model" aria-hidden="true">
      <div class="hero__fade">
        <SceneGate
          :loader="loader"
          :scene-props="sceneProps"
          :poster="poster"
          poster-small
          :poster-sizes="POSTER_SIZES"
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
      <h1 id="hero-title" class="hero__title">
        {{ hero.title.before }}<em class="hero__accent">{{ hero.title.accent }}</em
        >{{ hero.title.after }}
      </h1>
      <p class="hero__desc"><ContentValue :value="hero.description" /></p>
      <!-- Solo móvil: en ≥ 768 px el botón ya está en la cabecera -->
      <BaseButton to="/contacto#cita" arrow class="hero__cta">Pedir cita</BaseButton>
    </div>
  </section>
</template>

<style scoped>
.hero {
  /* Alto de la sección; el pie se dimensiona con él para no pisar el texto en pantallas bajas */
  --hero-h: max(100svh, 40rem);
  display: grid;
  align-items: end;
  min-height: var(--hero-h);
  padding-top: var(--nav-h);
  color: var(--color-ink);
  /* Hueso plano: el pie 3D es la única pieza de color */
  background: var(--color-bone);
}

/* ---------- Pie ---------- */
/* Apilado (móvil y tablet vertical): el pie ocupa lo que deja el bloque de texto (--text-h), sin pasarse del ancho
   (108 vw: deja que la puntera y el talón rocen los bordes sin cortarse) y se centra en el hueco entre navbar y texto */
.hero__model {
  --text-h: 22rem;
  --foot-w: clamp(13rem, min(84vw, 26rem), calc(var(--hero-h) - var(--nav-h) - var(--text-h)));
  position: absolute;
  z-index: 1;
  top: calc(var(--nav-h) + max(0.5rem, (var(--hero-h) - var(--nav-h) - var(--text-h) - var(--foot-w)) / 2));
  left: 50%;
  width: var(--foot-w);
  translate: -50% 0;
  filter: drop-shadow(0 30px 36px rgb(6 26 44 / 0.22));
  /* El pie solo reacciona al scroll de la página, no es interactivo: los toques lo atraviesan y el dedo puede
     arrastrar para hacer scroll encima del modelo (el canvas WebGL, si no, captura el gesto) */
  pointer-events: none;
  touch-action: pan-y;
  /* Sin fundido desde 0 con retardo: el póster es el LCP y debe verse en cuanto pinta; solo asienta (sube un poco) */
  animation: model-in 0.9s var(--ease-out-soft) both;
}
html[data-intro='play'] .hero__model {
  animation-delay: 0.75s;
}
@keyframes model-in {
  from {
    opacity: 0.4;
    transform: translateY(4%) scale(0.98);
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
  animation: fade-up 0.9s var(--ease-out-soft) both;
  animation-delay: 0.5s;
}
html[data-intro='play'] .hero__scroll {
  animation-delay: 1.3s;
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
  /* En iPhone con barra de inicio el texto no queda pegado al borde (viewport-fit=cover) */
  padding-bottom: calc(clamp(2rem, 8svh, 5rem) + env(safe-area-inset-bottom, 0px));
}
.hero__eyebrow {
  margin-bottom: 1rem;
  color: rgb(6 26 44 / 0.7);
  animation: fade-up 0.7s var(--ease-out-soft) both;
  animation-delay: 0.05s;
}
.hero__title {
  max-width: 9.5ch;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(3rem, 1.2rem + 7.2vw, 7.5rem);
  line-height: 0.96;
  letter-spacing: -0.035em;
  text-wrap: balance;
  animation: fade-up 0.8s var(--ease-out-soft) both;
  animation-delay: 0.12s;
}
.hero__desc {
  max-width: 32ch;
  margin-top: clamp(1rem, 2vw, 1.5rem);
  color: rgb(6 26 44 / 0.72);
  font-size: var(--text-body);
  line-height: var(--text-body--line-height);
  animation: fade-up 0.8s var(--ease-out-soft) both;
  animation-delay: 0.22s;
}
/* Acento: las propias letras en el cyan principal de la paleta */
.hero__accent {
  font-style: normal;
  font-weight: 600;
  color: var(--color-primary);
}
/* Con el loading de marca encima (primera visita) el texto entra justo cuando se retira, no después */
html[data-intro='play'] .hero__eyebrow {
  animation-delay: 0.75s;
}
html[data-intro='play'] .hero__title {
  animation-delay: 0.82s;
}
html[data-intro='play'] .hero__desc {
  animation-delay: 0.92s;
}
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
}

.hero__cta {
  display: none;
  margin-top: 1.5rem;
  animation: fade-up 0.8s var(--ease-out-soft) both;
  animation-delay: 0.32s;
}
html[data-intro='play'] .hero__cta {
  animation-delay: 1.02s;
}
@media (max-width: 767px) {
  .hero__cta {
    display: inline-flex;
  }
}
@media (max-width: 767px) and (max-height: 520px) and (min-aspect-ratio: 1/1) {
  .hero__cta {
    display: none;
  }
}

/* Móvil: sin indicador de scroll. El ratón es una metáfora de escritorio, el gesto en táctil es evidente y el icono
   competía con el texto en el borde inferior */
@media (max-width: 767px) {
  .hero__scroll {
    display: none;
  }
}

/* Tablet vertical: sigue apilado (texto abajo) pero con un pie más grande; lado a lado solo cabe apaisado */
@media (min-width: 768px) {
  .hero__model {
    --text-h: 21rem;
    --foot-w: clamp(20rem, min(100vw, 44rem), calc(var(--hero-h) - var(--nav-h) - var(--text-h)));
  }
  .hero__text {
    padding-bottom: calc(clamp(3rem, 8svh, 5rem) + env(safe-area-inset-bottom, 0px));
  }
}

/* Móviles muy estrechos (≤ 340 px): el titular baja un punto para que «Todo empieza» no desborde */
@media (max-width: 340px) {
  .hero__title {
    font-size: 2.6rem;
  }
}

/* Lado a lado: tablet/escritorio apaisados y móvil apaisado */
@media (min-width: 768px) and (min-aspect-ratio: 1/1), (max-height: 520px) and (min-aspect-ratio: 1/1) {
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

/* Móvil apaisado y ventanas muy bajas: el hero cabe en la pantalla (sin los 40 rem mínimos) y el titular escala con el alto */
@media (max-height: 520px) and (min-aspect-ratio: 1/1) {
  .hero {
    --hero-h: 100svh;
  }
  .hero__model {
    width: min(48vw, calc(100svh - var(--nav-h) - 1rem));
    right: 6vw;
  }
  .hero__title {
    font-size: clamp(2.25rem, 13svh, 4.5rem);
  }
  .hero__desc {
    margin-top: 0.75rem;
  }
  .hero__scroll {
    display: none;
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
  .hero__desc,
  .hero__cta,
  .hero__title {
    animation: none;
  }
}
</style>
