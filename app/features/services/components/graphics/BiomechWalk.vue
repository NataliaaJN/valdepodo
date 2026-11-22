<script setup lang="ts">
/**
 * «El paseo» — experiencia del Estudio biomecánico. Capítulo tinta fijado (`pin`) durante unas pantallas de
 * scroll: el scroll es el paseo. Una cámara recorre un camino de huellas (una estación por fase), cada huella
 * llega, se enciende con su mapa de presión (talón → apoyo medio → despegue en marcha y carrera) y queda
 * marcada; el texto de la fase aparece junto a ella. La zancada se alarga en la carrera, las dos huellas se
 * comparan en la valoración y la última se dibuja como plantilla.
 *
 * - Un único `proxy.p` (−0.5 … N−0.5) lo mueve ScrollTrigger con `scrub`; de él salen la cámara (continua) y el
 *   estado discreto (`idx`, `sub`) que enciende los mapas. Al volver atrás todo se deshace solo.
 * - Los puntos de la barra de fases saltan a cada estación (botones, accesibles con teclado).
 * - Reduced motion y sin JS: sin pin ni cámara; lista de fases con una miniatura estática de cada una.
 * - Accesibilidad: las fases son un `<ol>` siempre presente; el lienzo es `aria-hidden`.
 */
import { gsap } from 'gsap'
import { biomechPhases } from '~/features/services/data/biomech'
import { subStep, walkY } from '~/features/services/data/biomech-walk'

const phases = biomechPhases
const N = phases.length
const AXIS_Y = 320 // ordenada en pantalla de la estación activa
const MAX_Y = walkY[N - 1]!

const root = ref<HTMLElement | null>(null)
const stageEl = ref<HTMLElement | null>(null)
const worldEl = ref<SVGGElement | null>(null)
const stations: (Element | undefined)[] = []

const live = ref(false)
const viewBox = ref('0 0 400 640')
const idx = ref(0)
const sub = ref(0)
let st: ScrollTrigger | undefined

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

/** Ordenada de la cámara para el progreso `p` (interpola entre estaciones; fuera de rango sigue recto). */
function camY(p: number) {
  const c = clamp(p, 0, N - 1)
  const i0 = Math.floor(c)
  const i1 = Math.min(N - 1, i0 + 1)
  const base = walkY[i0]! + (walkY[i1]! - walkY[i0]!) * (c - i0)
  return base + (p - c) * 330
}

function update(p: number) {
  if (worldEl.value) gsap.set(worldEl.value, { y: -camY(p) })
  stations.forEach((el, i) => {
    if (!el) return
    const d = i - p // > 0: la huella está por delante
    const opacity = d > 0 ? 0.28 + 0.72 * (1 - Math.min(d, 1)) : Math.max(0.32, 1 + d * 0.45)
    const scale = 1 + 0.07 * clamp(d, 0, 1)
    gsap.set(el, { opacity, scale, svgOrigin: `200 ${AXIS_Y + walkY[i]!}` })
  })
  const k = clamp(Math.round(p), 0, N - 1)
  idx.value = k
  sub.value = subStep(p - k)
}

const roleFor = (i: number) => (i === idx.value ? 'active' : i < idx.value ? 'past' : 'future')

function goTo(i: number) {
  if (!st) return
  const t = (i + 0.5) / N // p = i ⇔ progreso (i + 0.5) / N de la animación
  window.scrollTo({ top: st.start + t * (st.end - st.start), behavior: 'smooth' })
}

useGsapContext(root, (c) => {
  if (!c.motion || !stageEl.value) return undefined
  root.value?.classList.add('is-live') // síncrono: ScrollTrigger mide con la maqueta ya en modo fijado
  live.value = true
  // Móvil: el camino se ve en horizontal (la zona libre es ancha y baja), centrado en la estación activa
  viewBox.value = c.mobile ? '0 180 400 320' : '0 0 400 640'

  const proxy = { p: -0.5 }
  update(proxy.p)
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: stageEl.value,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * (c.mobile ? 4 : 5))}`,
      pin: true,
      scrub: 0.7,
      invalidateOnRefresh: true,
    },
  })
  tl.to(proxy, { p: N - 0.5, duration: 1, onUpdate: () => update(proxy.p) })
  st = tl.scrollTrigger

  return () => {
    st = undefined
    viewBox.value = '0 0 400 640'
    live.value = false
    root.value?.classList.remove('is-live')
  }
})
</script>

<template>
  <section ref="root" class="walk chapter-ink section-clip" aria-labelledby="walk-title" data-nav-theme="ink">
    <div ref="stageEl" class="walk__stage">
      <div class="container-wide walk__grid">
        <div class="walk__copy">
          <header class="walk__head">
            <h2 id="walk-title" class="walk__title">Qué incluye el estudio</h2>
          </header>

          <ol class="walk__list" role="list">
            <li
              v-for="(phase, i) in phases"
              :key="phase.id"
              class="walk__item"
              :class="{ 'is-active': i === idx }"
              :aria-current="live && i === idx ? 'step' : undefined"
            >
              <svg
                v-if="!live"
                class="walk__mini"
                viewBox="0 70 400 500"
                aria-hidden="true"
                focusable="false"
              >
                <WalkStation :phase="i" :cy="320" role="active" :sub="1" mode="instant" />
              </svg>
              <p class="walk__num">{{ phase.number }}</p>
              <h3 class="walk__name">{{ phase.title }}</h3>
              <ContentValue :value="phase.text" as="p" class="walk__text" />
              <NuxtLink
                v-if="phase.link"
                :to="phase.link.to"
                class="walk__link"
                :tabindex="live && i !== idx ? -1 : undefined"
              >
                {{ phase.link.label }} <span aria-hidden="true">→</span>
              </NuxtLink>
            </li>
          </ol>

          <nav class="walk__rail" aria-label="Fases del estudio">
            <button
              v-for="(phase, i) in phases"
              :key="phase.id"
              type="button"
              class="walk__dot"
              :class="{ 'is-active': i === idx, 'is-done': i < idx }"
              :aria-label="`Ir a la fase ${phase.number}: ${phase.title}`"
              :aria-current="i === idx ? 'step' : undefined"
              @click="goTo(i)"
            >
              <span aria-hidden="true">{{ phase.number }}</span>
            </button>
          </nav>
        </div>

        <figure class="walk__visual" aria-hidden="true">
          <div class="walk__mask">
            <svg :viewBox="viewBox" class="walk__svg" focusable="false">
              <g ref="worldEl">
                <line class="walk__axis" x1="200" :y1="AXIS_Y - 420" x2="200" :y2="AXIS_Y + MAX_Y + 420" />
                <WalkStation
                  v-for="(_, i) in phases"
                  :key="i"
                  :ref="(c) => (stations[i] = (c as { $el?: Element } | null)?.$el)"
                  :phase="i"
                  :cy="AXIS_Y + walkY[i]!"
                  :role="roleFor(i)"
                  :sub="sub"
                  mode="morph"
                />
              </g>
            </svg>
          </div>
          <div class="walk__scale">
            <span>Menos carga</span>
            <span class="walk__scale-bar" />
            <span>Más carga</span>
          </div>
        </figure>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ---------- Versión estática (sin fijado): lista de fases con su miniatura ---------- */
.walk__stage {
  padding-block: clamp(3.5rem, 7vw, 6rem);
}
.walk__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2.5rem;
}
.walk__title {
  font-size: var(--text-display-m);
  line-height: var(--text-display-m--line-height);
}
.walk__list {
  display: grid;
  gap: 3rem;
  margin-top: 2.5rem;
}
.walk__mini {
  display: block;
  width: min(100%, 14rem);
  margin-bottom: 1rem;
  overflow: visible;
}
.walk__num {
  font-family: var(--font-display);
  font-size: var(--text-display-m);
  line-height: 1;
  color: var(--color-cyan);
}
.walk__name {
  margin-top: 0.5rem;
  font-size: var(--text-heading-s);
  line-height: var(--text-heading-s--line-height);
}
.walk__text {
  margin-top: 0.75rem;
  max-width: 40ch;
  color: var(--color-text-secondary);
}
.walk__link {
  display: inline-flex;
  gap: 0.5rem;
  margin-top: 1rem;
  font-weight: 600;
  color: var(--color-cyan);
  text-underline-offset: 4px;
}
.walk:not(.is-live) .walk__visual,
.walk:not(.is-live) .walk__rail {
  display: none;
}

/* ---------- Versión viva: capítulo fijado a pantalla completa ---------- */
.walk.is-live .walk__stage {
  box-sizing: border-box;
  height: 100svh;
  padding-block: 5.5rem 1rem;
  display: flex;
}
.walk.is-live .walk__grid {
  flex: 1;
  min-height: 0;
  gap: 0.5rem;
  grid-template-rows: auto minmax(0, 1fr) auto auto;
}
.walk.is-live .walk__copy {
  display: contents;
}
/* Móvil: cabecera · camino · fase · barra de fases (el texto se lee bajo las huellas) */
.walk.is-live .walk__head {
  order: 1;
}
.walk.is-live .walk__visual {
  order: 2;
}
.walk.is-live .walk__list {
  order: 3;
}
.walk.is-live .walk__rail {
  order: 4;
}
.walk.is-live .walk__list {
  display: grid;
  gap: 0;
  margin-top: 0;
}
.walk.is-live .walk__item {
  grid-area: 1 / 1;
  opacity: 0;
  translate: 0 14px;
  pointer-events: none;
  transition:
    opacity 320ms var(--ease-out-soft),
    translate 320ms var(--ease-out-soft);
}
.walk.is-live .walk__item.is-active {
  opacity: 1;
  translate: 0 0;
  pointer-events: auto;
}
.walk.is-live .walk__num {
  font-size: clamp(1.75rem, 1.4rem + 1.2vw, 2.5rem);
}
.walk.is-live .walk__text {
  font-size: 1rem;
  line-height: 1.5;
}

.walk__scale {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  padding-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}
.walk__scale-bar {
  width: 7rem;
  height: 0.5rem;
  border-radius: 999px;
  background: linear-gradient(90deg, #1a33d9, #00bff2 22%, #33d940 44%, #ffe61a 66%, #ff8010 84%, #e61a1a);
}
.walk__visual {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  margin: 0;
}
.walk__mask {
  flex: 1;
  min-height: 0;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 16%, #000 82%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0, #000 16%, #000 82%, transparent 100%);
}
.walk__svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.walk__axis {
  stroke: var(--color-cyan);
  stroke-opacity: 0.22;
  stroke-width: 1.5;
  stroke-dasharray: 2 12;
  stroke-linecap: round;
}

.walk__rail {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
}
.walk__dot {
  display: grid;
  place-items: center;
  min-width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-s, 6px);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: transparent;
  transition:
    background-color var(--dur-fast) ease,
    color var(--dur-fast) ease;
}
.walk__dot.is-done {
  color: var(--color-bone);
}
.walk__dot.is-active {
  background: var(--color-primary);
  color: var(--color-ink);
}
.walk__dot:focus-visible {
  outline: 2px solid var(--color-cyan);
  outline-offset: 2px;
}
@media (hover: hover) and (pointer: fine) {
  .walk__dot:not(.is-active):hover {
    background: rgb(241 239 233 / 0.1);
    color: var(--color-bone);
  }
}

@media (min-width: 1024px) {
  .walk.is-live .walk__stage {
    padding-block: 6rem 2rem;
  }
  .walk.is-live .walk__grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-template-rows: minmax(0, 1fr);
    column-gap: 1.5rem;
  }
  .walk.is-live .walk__copy {
    display: flex;
    flex-direction: column;
    justify-content: center;
    grid-column: 1 / span 5;
    gap: 2.5rem;
    min-height: 0;
  }
  .walk.is-live .walk__visual {
    grid-column: 7 / span 6;
  }
  .walk.is-live .walk__rail {
    justify-content: flex-start;
  }
  .walk.is-live .walk__name {
    font-size: clamp(1.75rem, 1.3rem + 1.2vw, 2.5rem);
  }
  .walk.is-live .walk__text {
    font-size: var(--text-body-l);
    line-height: var(--text-body-l--line-height);
  }
}
@media (min-width: 768px) and (max-width: 1023px) {
  .walk__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 2rem;
  }
  .walk.is-live .walk__list {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .walk__item,
  .walk__dot {
    transition: none;
  }
}
</style>
