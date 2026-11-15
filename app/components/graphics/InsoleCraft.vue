<script setup lang="ts">
/**
 * «Cómo hacemos tus plantillas» — experiencia de Plantillas personalizadas. Capítulo tinta fijado (`pin`): el
 * scroll es el proceso. Sobre un boceto técnico en perfil (trazo a lápiz sobre tinta) se recorren los cuatro
 * pasos de `insoleProcess`:
 *   01 Valoración   → se traza el perfil del pie y se marca dónde carga (mapa de presión desigual).
 *   02 Análisis     → se acotan las zonas y se dibuja el calzado que la va a alojar.
 *   03 Diseño       → se dibuja la plantilla; el arco se eleva, el talón sube y se ajustan las nervaduras.
 *                     Los parámetros se mueven (arriba, abajo, un punto intermedio): no es una forma fija.
 *   04 Entrega      → la plantilla se rellena, el apoyo se reparte y se marcan entrega y revisión.
 *
 * - Un único `p` (0 … N) lo mueve ScrollTrigger con `scrub`; todo el dibujo sale de él (perfil paramétrico),
 *   así que al volver atrás se deshace solo. Los puntos de la barra saltan a cada paso (botones con teclado).
 * - Reduced motion y sin JS: sin pin; lista de pasos y el dibujo terminado.
 * - Es una metáfora visual: no representa un proceso de fabricación ni un producto concreto (spec 04 §2.2).
 */
import { gsap } from 'gsap'
import { CONCEPTUAL_LABEL, insoleProcess } from '~/data/insole'

const steps = insoleProcess
const N = steps.length

const root = ref<HTMLElement | null>(null)
const stageEl = ref<HTMLElement | null>(null)
const live = ref(false)
const p = ref(N) // estático = dibujo terminado
const idx = ref(N - 1)
let st: ScrollTrigger | undefined

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = (t: number) => 1 - (1 - t) ** 3
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
/** Tramo [a, b] del progreso, 0 → 1 con salida suave. */
const seg = (a: number, b: number) => ease(clamp((p.value - a) / (b - a)))

/* ---------- Geometría del perfil (unidades del lienzo 640 × 440) ---------- */
const GROUND = 330
const X0 = 60
const X1 = 580
const g = (x: number, c: number, w: number) => Math.exp(-(((x - c) / w) ** 2))
const sstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/** Superficie superior e inferior de la plantilla para una altura de arco y una elevación de talón (0 … 1). */
function surf(x: number, arch: number, heel: number) {
  const raise = heel * 36 * (1 - sstep(120, 390, x))
  const archL = arch * 78 * g(x, 305, 88)
  const cup = 30 * g(x, 92, 46)
  const fore = 10 * g(x, 520, 58)
  const taper = 1 - 0.55 * sstep(540, 585, x)
  const low = GROUND - 5 - raise - 0.18 * archL
  const top = low - 12 * taper - archL * 0.82 - cup - fore
  return { top, low }
}

const XS: number[] = []
for (let x = X0; x <= X1; x += 8) XS.push(x)
const poly = (f: (x: number) => number) =>
  XS.map((x, i) => `${i ? 'L' : 'M'}${x} ${f(x).toFixed(1)}`).join('')

const params = computed(() => {
  // Los parámetros viajan: el arco sube, se pasa de largo y se asienta; el talón sube y baja a un punto medio.
  const a1 = seg(2.15, 2.55)
  const a2 = seg(2.62, 2.9)
  const arch = lerp(lerp(0.15, 1, a1), 0.68, a2)
  const h1 = seg(2.4, 2.7)
  const h2 = seg(2.7, 2.95)
  const heel = lerp(lerp(0, 1, h1), 0.45, h2)
  return { arch, heel }
})

const topD = computed(() => poly((x) => surf(x, params.value.arch, params.value.heel).top))
const lowD = computed(() => poly((x) => surf(x, params.value.arch, params.value.heel).low))
const fillD = computed(() => {
  const { arch, heel } = params.value
  const top = XS.map((x, i) => `${i ? 'L' : 'M'}${x} ${surf(x, arch, heel).top.toFixed(1)}`).join('')
  const low = [...XS]
    .reverse()
    .map((x) => `L${x} ${surf(x, arch, heel).low.toFixed(1)}`)
    .join('')
  return `${top}${low}Z`
})

/** Perfil del pie (trazo fino): sigue el arco con holgura y sube al tobillo. */
const footD = computed(() => {
  const ft = (x: number) => surf(x, 0.55, 0).top - 26
  const xs = XS.filter((x) => x >= 92 && x <= 552)
  const mid = xs.map((x) => `L${x} ${ft(x).toFixed(1)}`).join('')
  return `M82 150C74 196 80 238 92 ${ft(92).toFixed(1)}${mid}C590 ${ft(552).toFixed(1)} 604 300 598 ${GROUND - 10}`
})

/** Calzado: suela, contrafuerte y puntera (silueta genérica, sin marca ni modelo). */
const SHOE_D = `M46 ${GROUND}H606C624 ${GROUND} 628 296 596 278C540 250 470 240 410 224C330 204 240 168 150 138C110 124 80 126 62 160C44 204 40 268 46 ${GROUND}Z`

/** Nervaduras bajo el arco: solo donde hay hueco. */
const ribs = computed(() => {
  const out: { x: number; y1: number; y2: number; k: number }[] = []
  let k = 0
  for (let x = 214; x <= 408; x += 14) {
    const { top, low } = surf(x, params.value.arch, params.value.heel)
    out.push({ x, y1: top + 3, y2: low - 1, k: k++ })
  }
  return out
})
const ribGrow = (k: number) => seg(2.5 + k * 0.022, 2.72 + k * 0.022)

/** Marcas de la elevación del talón: tramos entre el suelo y la plantilla. */
const hatch = computed(() => {
  const out: { x: number; y1: number; y2: number }[] = []
  for (let x = 66; x <= 392; x += 13) {
    const { low } = surf(x, params.value.arch, params.value.heel)
    if (GROUND - low > 8) out.push({ x, y1: GROUND, y2: low + 1 })
  }
  return out
})

/** Cota vertical del arco, a la altura del punto más alto. */
const dim = computed(() => {
  const { top, low } = surf(305, params.value.arch, params.value.heel)
  return { top, low, len: low - top }
})
const heelPoint = computed(() => surf(92, params.value.arch, params.value.heel).top)
const forePoint = computed(() => surf(520, params.value.arch, params.value.heel).top)

/** Huella de presión bajo el perfil: desigual al valorar, repartida al entregar. */
const pressure = computed(() => {
  const even = seg(3.15, 3.7)
  const a = [
    { x: 110, rx: 46, ry: 7, o: 1 },
    { x: 305, rx: 20, ry: 3, o: 0.35 },
    { x: 520, rx: 40, ry: 6, o: 0.7 },
  ]
  const target = [
    { rx: 42, ry: 5.5, o: 0.75 },
    { rx: 38, ry: 5, o: 0.75 },
    { rx: 40, ry: 5.5, o: 0.75 },
  ]
  return a.map((e, i) => ({
    x: e.x,
    rx: lerp(e.rx, target[i]!.rx, even),
    ry: lerp(e.ry, target[i]!.ry, even),
    o: lerp(e.o, target[i]!.o, even),
    // rampa clínica: carga alta (rojo) → repartida (verde)
    fill: `color-mix(in srgb, #33d940 ${Math.round(even * 100)}%, ${i === 0 ? '#e61a1a' : i === 1 ? '#00bff2' : '#ffe61a'})`,
  }))
})

const v = computed(() => ({
  ground: seg(0, 0.35),
  foot: seg(0.1, 0.95),
  footFade: lerp(1, 0.22, seg(1.6, 2.2)),
  press: seg(0.45, 1.05) * lerp(1, 0.3, seg(1.9, 2.1)) + seg(3.0, 3.2) * 0.7,
  brackets: seg(1.15, 1.6) * (1 - seg(3.0, 3.25)),
  shoe: seg(1.3, 2.0),
  shoeFade: lerp(1, 0.4, seg(2.2, 2.6)),
  top: seg(2.0, 2.45),
  low: seg(2.15, 2.6),
  leaders: [seg(2.55, 2.75), seg(2.62, 2.82), seg(2.7, 2.9), seg(2.76, 2.95)] as const,
  leadersOut: 1 - seg(3.0, 3.2),
  fill: seg(3.0, 3.4),
  cover: seg(3.1, 3.45),
  follow: seg(3.4, 3.95),
}))

/* ---------- Scroll ---------- */
function update(value: number) {
  p.value = value
  idx.value = clamp(Math.floor(value), 0, N - 1)
}

function goTo(i: number) {
  if (!st) return
  const t = (i + 0.5) / N
  window.scrollTo({ top: st.start + t * (st.end - st.start), behavior: 'smooth' })
}

useGsapContext(root, (c) => {
  if (!c.motion || !stageEl.value) return undefined
  root.value?.classList.add('is-live') // síncrono: ScrollTrigger mide con la maqueta ya fijada
  live.value = true
  const proxy = { p: 0 }
  update(0)
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
  tl.to(proxy, { p: N, duration: 1, onUpdate: () => update(proxy.p) })
  st = tl.scrollTrigger

  return () => {
    st = undefined
    update(N)
    live.value = false
    root.value?.classList.remove('is-live')
  }
})
</script>

<template>
  <section
    ref="root"
    class="craft chapter-ink section-clip"
    aria-labelledby="craft-title"
    data-nav-theme="ink"
  >
    <div ref="stageEl" class="craft__stage">
      <div class="container-wide craft__grid">
        <div class="craft__copy">
          <header class="craft__head">
            <h2 id="craft-title" class="craft__title">Cómo hacemos tus plantillas</h2>
          </header>

          <ol class="craft__list" role="list">
            <li
              v-for="(step, i) in steps"
              :key="step.title"
              class="craft__item"
              :class="{ 'is-active': i === idx }"
              :aria-current="live && i === idx ? 'step' : undefined"
            >
              <p class="craft__num">{{ String(i + 1).padStart(2, '0') }}</p>
              <h3 class="craft__name">{{ step.title }}</h3>
              <ContentValue :value="step.text" as="p" class="craft__text" />
              <NuxtLink
                v-if="step.link"
                :to="step.link.to"
                class="craft__link"
                :tabindex="live && i !== idx ? -1 : undefined"
              >
                {{ step.link.label }} <span aria-hidden="true">→</span>
              </NuxtLink>
            </li>
          </ol>

          <nav class="craft__rail" aria-label="Pasos del proceso">
            <button
              v-for="(step, i) in steps"
              :key="step.title"
              type="button"
              class="craft__dot"
              :class="{ 'is-active': i === idx, 'is-done': i < idx }"
              :aria-label="`Ir al paso ${i + 1}: ${step.title}`"
              :aria-current="i === idx ? 'step' : undefined"
              @click="goTo(i)"
            >
              <span aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
            </button>
          </nav>
        </div>

        <figure class="craft__visual" aria-hidden="true">
          <svg viewBox="0 70 640 370" class="craft__svg" focusable="false">
            <!-- Suelo -->
            <line
              class="k-line k-line--ground"
              x1="30"
              :y1="GROUND"
              x2="610"
              :y2="GROUND"
              pathLength="1"
              :style="{ strokeDashoffset: 1 - v.ground }"
            />

            <!-- 01 · Perfil del pie -->
            <path
              class="k-line k-line--foot"
              :d="footD"
              pathLength="1"
              :style="{ strokeDashoffset: 1 - v.foot, opacity: v.footFade }"
            />

            <!-- Mapa de presión bajo el suelo -->
            <g :style="{ opacity: v.press }">
              <ellipse
                v-for="e in pressure"
                :key="e.x"
                :cx="e.x"
                :cy="GROUND + 22"
                :rx="e.rx"
                :ry="e.ry"
                :fill="e.fill"
                :fill-opacity="e.o"
              />
            </g>

            <!-- 02 · Zonas y calzado -->
            <g class="k-zones" :style="{ opacity: v.brackets }">
              <g
                v-for="z in [
                  { a: 62, b: 180, t: 'Talón' },
                  { a: 222, b: 392, t: 'Arco' },
                  { a: 440, b: 580, t: 'Antepié' },
                ]"
                :key="z.t"
              >
                <path class="k-zone" :d="`M${z.a} ${GROUND + 48}v6H${z.b}v-6`" />
                <text class="k-text" :x="(z.a + z.b) / 2" :y="GROUND + 74" text-anchor="middle">
                  {{ z.t }}
                </text>
              </g>
            </g>
            <path
              class="k-line k-line--shoe"
              :d="SHOE_D"
              pathLength="1"
              :style="{ strokeDashoffset: 1 - v.shoe, opacity: v.shoeFade }"
            />

            <!-- 03 · Plantilla -->
            <path class="k-fill" :d="fillD" :style="{ opacity: v.fill * 0.3 }" />
            <g class="k-hatch" :style="{ opacity: v.top }">
              <line v-for="h in hatch" :key="h.x" :x1="h.x" :y1="h.y1" :x2="h.x + 6" :y2="h.y2" />
            </g>
            <path
              class="k-line k-line--low"
              :d="lowD"
              pathLength="1"
              :style="{ strokeDashoffset: 1 - v.low }"
            />
            <g class="k-ribs">
              <line
                v-for="r in ribs"
                :key="r.k"
                :x1="r.x"
                :y1="r.y1"
                :x2="r.x"
                :y2="r.y1 + (r.y2 - r.y1) * ribGrow(r.k)"
                :style="{ opacity: ribGrow(r.k) * (1 - v.fill * 0.55) }"
              />
            </g>
            <path
              class="k-line k-line--top"
              :class="{ 'is-final': v.cover > 0.02 }"
              :d="topD"
              pathLength="1"
              :style="{ strokeDashoffset: 1 - v.top }"
            />

            <!-- Acotaciones del diseño -->
            <g class="k-leaders" :style="{ opacity: v.leadersOut }">
              <g :style="{ opacity: v.leaders[0] }">
                <line :x1="92" y1="104" :x2="92" :y2="heelPoint - 5" />
                <text class="k-text" x="92" y="94" text-anchor="middle">Copa del talón</text>
              </g>
              <g :style="{ opacity: v.leaders[1] }">
                <line x1="305" y1="104" x2="305" :y2="dim.top - 5" />
                <text class="k-text" x="305" y="94" text-anchor="middle">Altura del arco</text>
                <path
                  class="k-dim"
                  :d="`M328 ${dim.top}V${dim.low}M323 ${dim.top + 6}l5 -6l5 6M323 ${dim.low - 6}l5 6l5 -6`"
                />
              </g>
              <g :style="{ opacity: v.leaders[2] }">
                <line x1="520" y1="104" x2="520" :y2="forePoint - 5" />
                <text class="k-text" x="520" y="94" text-anchor="middle">Apoyo del antepié</text>
              </g>
              <g :style="{ opacity: v.leaders[3] }">
                <line x1="200" :y1="GROUND + 6" x2="200" :y2="GROUND + 40" />
                <text class="k-text" x="200" :y="GROUND + 58" text-anchor="middle">Elevación del talón</text>
              </g>
            </g>

            <!-- 04 · Entrega y revisión -->
            <g class="k-follow">
              <line
                x1="150"
                y1="402"
                x2="490"
                y2="402"
                pathLength="1"
                :style="{ strokeDasharray: 1, strokeDashoffset: 1 - v.follow }"
              />
              <g :style="{ opacity: seg(3.45, 3.6) }">
                <circle cx="150" cy="402" r="5" />
                <text class="k-text" x="150" y="424" text-anchor="middle">Entrega</text>
              </g>
              <g :style="{ opacity: seg(3.75, 3.95) }">
                <circle cx="490" cy="402" r="5" />
                <text class="k-text" x="490" y="424" text-anchor="middle">Revisión</text>
              </g>
            </g>
          </svg>
          <figcaption class="craft__caption">{{ CONCEPTUAL_LABEL }}</figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ---------- Versión estática (sin fijado): lista de pasos y el dibujo terminado ---------- */
.craft__stage {
  padding-block: clamp(3.5rem, 7vw, 6rem);
}
.craft__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2.5rem;
}
.craft__title {
  font-size: var(--text-display-m);
  line-height: var(--text-display-m--line-height);
}
.craft__list {
  display: grid;
  gap: 2.5rem;
  margin-top: 2.5rem;
}
.craft__num {
  font-family: var(--font-display);
  font-size: var(--text-display-m);
  line-height: 1;
  color: var(--color-cyan);
}
.craft__name {
  margin-top: 0.5rem;
  font-size: var(--text-heading-s);
  line-height: var(--text-heading-s--line-height);
}
.craft__text {
  margin-top: 0.75rem;
  max-width: 40ch;
  color: var(--color-text-secondary);
}
.craft__link {
  display: inline-flex;
  gap: 0.5rem;
  margin-top: 1rem;
  font-weight: 600;
  color: var(--color-cyan);
  text-underline-offset: 4px;
}
.craft:not(.is-live) .craft__rail {
  display: none;
}

.craft__visual {
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin: 0;
}
.craft__svg {
  display: block;
  width: 100%;
  height: auto;
  min-height: 0;
  overflow: visible;
}
.craft__caption {
  padding-top: 0.5rem;
  text-align: center;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

/* ---------- Trazos del boceto ---------- */
.k-line {
  fill: none;
  stroke: var(--color-bone);
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1;
}
.k-line--ground {
  stroke-opacity: 0.4;
}
.k-line--foot {
  stroke-width: 1.2;
  stroke-opacity: 0.8;
}
.k-line--shoe {
  stroke-width: 1.2;
  stroke-opacity: 0.55;
}
.k-line--low {
  stroke-width: 1.4;
  stroke-opacity: 0.8;
}
.k-line--top {
  stroke-width: 2.2;
  transition: stroke 240ms ease;
}
.k-line--top.is-final {
  stroke: var(--color-cyan);
}
.k-fill {
  fill: var(--color-cyan);
}
.k-hatch line,
.k-ribs line {
  stroke: var(--color-bone);
  stroke-width: 1.2;
  stroke-linecap: round;
}
.k-hatch line {
  stroke-opacity: 0.35;
}
.k-ribs line {
  stroke-opacity: 0.85;
}
.k-leaders line,
.k-dim,
.k-zone {
  fill: none;
  stroke: var(--color-cyan);
  stroke-width: 1.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.k-zone {
  stroke-opacity: 0.8;
}
.k-text {
  fill: var(--color-bone);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.85;
}
.k-follow line {
  stroke: var(--color-cyan);
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-dasharray: 1;
}
.k-follow circle {
  fill: var(--color-ink);
  stroke: var(--color-cyan);
  stroke-width: 2;
}

/* ---------- Versión viva: capítulo fijado a pantalla completa ---------- */
.craft.is-live .craft__stage {
  box-sizing: border-box;
  height: 100svh;
  padding-block: 5.5rem 1rem;
  display: flex;
}
.craft.is-live .craft__grid {
  flex: 1;
  min-height: 0;
  gap: 0.5rem;
  grid-template-rows: auto minmax(0, 1fr) auto auto;
}
.craft.is-live .craft__copy {
  display: contents;
}
.craft.is-live .craft__head {
  order: 1;
}
.craft.is-live .craft__visual {
  order: 2;
  height: 100%;
}
.craft.is-live .craft__svg {
  flex: 1;
  height: 100%;
}
.craft.is-live .craft__list {
  order: 3;
  display: grid;
  gap: 0;
  margin-top: 0;
}
.craft.is-live .craft__rail {
  order: 4;
}
.craft.is-live .craft__item {
  grid-area: 1 / 1;
  opacity: 0;
  translate: 0 14px;
  pointer-events: none;
  transition:
    opacity 320ms var(--ease-out-soft),
    translate 320ms var(--ease-out-soft);
}
.craft.is-live .craft__item.is-active {
  opacity: 1;
  translate: 0 0;
  pointer-events: auto;
}
.craft.is-live .craft__num {
  font-size: clamp(1.75rem, 1.4rem + 1.2vw, 2.5rem);
}
.craft.is-live .craft__text {
  font-size: 1rem;
  line-height: 1.5;
}

.craft__rail {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
}
.craft__dot {
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
.craft__dot.is-done {
  color: var(--color-bone);
}
.craft__dot.is-active {
  background: var(--color-primary);
  color: var(--color-ink);
}
.craft__dot:focus-visible {
  outline: 2px solid var(--color-cyan);
  outline-offset: 2px;
}
@media (hover: hover) and (pointer: fine) {
  .craft__dot:not(.is-active):hover {
    background: rgb(241 239 233 / 0.1);
    color: var(--color-bone);
  }
}

@media (min-width: 1024px) {
  .craft.is-live .craft__stage {
    padding-block: 6rem 2rem;
  }
  .craft.is-live .craft__grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-template-rows: minmax(0, 1fr);
    column-gap: 1.5rem;
  }
  .craft.is-live .craft__copy {
    display: flex;
    flex-direction: column;
    justify-content: center;
    grid-column: 1 / span 5;
    gap: 2.5rem;
    min-height: 0;
  }
  .craft.is-live .craft__visual {
    grid-column: 6 / span 7;
    justify-content: center;
  }
  .craft.is-live .craft__rail {
    justify-content: flex-start;
  }
  .craft.is-live .craft__name {
    font-size: clamp(1.75rem, 1.3rem + 1.2vw, 2.5rem);
  }
  .craft.is-live .craft__text {
    font-size: var(--text-body-l);
    line-height: var(--text-body-l--line-height);
  }
}
@media (min-width: 768px) and (max-width: 1023px) {
  .craft__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 2rem;
  }
  .craft.is-live .craft__list {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .craft__item,
  .craft__dot,
  .k-line--top {
    transition: none;
  }
}
</style>
