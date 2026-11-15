<script setup lang="ts">
/**
 * «Cómo hacemos tus plantillas» — experiencia de Plantillas personalizadas. Capítulo tinta fijado (`pin`): el
 * scroll es el proceso. Un boceto en perspectiva de UNA plantilla (modelo paramétrico proyectado a mano, como
 * el dibujo de un diseñador industrial) se construye a lo largo de los cuatro pasos de `insoleProcess`:
 *   01 Valoración   → la huella sobre el plano, con el reparto de la carga (desigual).
 *   02 Análisis     → se miden longitud y ancho, se acotan las zonas y se trazan las secciones (todavía planas).
 *   03 Diseño       → las secciones se levantan: el arco sube, el talón se eleva, se extruye el canto y se
 *                     abren las nervaduras. Los parámetros viajan (arriba, abajo, punto medio): no es una
 *                     forma fija. Anotaciones con flechas señalan cada parámetro.
 *   04 Entrega      → se sombrea como un render, se retiran las cotas y se marcan entrega y revisión.
 *
 * - Un único `p` (0 … N) lo mueve ScrollTrigger con `scrub`; todo el dibujo sale de él, así que al volver atrás
 *   se deshace solo. Los puntos de la barra saltan a cada paso (botones accesibles con teclado).
 * - Reduced motion y sin JS: sin pin; lista de pasos y el dibujo terminado.
 * - Metáfora visual: no representa un proceso de fabricación ni un producto concreto (spec 04 §2.2).
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
const g = (x: number, c: number, w: number) => Math.exp(-(((x - c) / w) ** 2))
const sstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/* ---------- Modelo: plantilla de 500 de largo (X) por ~190 de ancho (Y), alturas en Z ---------- */
const L = 500
/** Semianchura por posición longitudinal (0 talón → 1 puntera), interpolada con coseno entre nudos. */
const KNOTS: readonly (readonly [number, number])[] = [
  [0, 0],
  [0.03, 46],
  [0.12, 60],
  [0.4, 51],
  [0.62, 75],
  [0.82, 90],
  [0.94, 78],
  [0.985, 44],
  [1, 0],
]
function halfWidth(u: number) {
  for (let i = 1; i < KNOTS.length; i++) {
    const [u1, w1] = KNOTS[i]!
    if (u <= u1) {
      const [u0, w0] = KNOTS[i - 1]!
      const t = (u - u0) / (u1 - u0)
      return lerp(w0, w1, (1 - Math.cos(Math.PI * t)) / 2)
    }
  }
  return 0
}
/** t = 0 borde lateral · t = 1 borde medial (el que mira al espectador, con el arco). */
const yAt = (u: number, t: number) => {
  const w = halfWidth(u)
  const med = w - 16 * g(u, 0.42, 0.13)
  return -w + t * (w + med)
}

/** Proyección oblicua (cabinet): X a la derecha, Y hacia el espectador, Z hacia arriba. */
const OX = 62
const OY = 268
const K = 0.45
const SP = 0.5
const CP = 0.92
const px = (X: number, Y: number) => OX + X + K * Y
const py = (Y: number, Z: number) => OY + SP * Y - CP * Z
const f1 = (n: number) => n.toFixed(1)

interface Params {
  lift: number
  arch: number
  heel: number
}
/** Altura de la cara superior y de la inferior (hueca bajo el arco) en (u, t). */
function zTop(u: number, t: number, q: Params) {
  const med = t ** 1.6
  const edge = (2 * t - 1) ** 2
  const arch = q.arch * 66 * g(u, 0.4, 0.15) * med
  const cup = 26 * g(u, 0.1, 0.13) * edge
  const fore = 7 * g(u, 0.78, 0.18)
  const raise = q.heel * 24 * (1 - sstep(0.04, 0.5, u))
  return q.lift * (11 + arch + cup + fore + raise)
}
function zLow(u: number, t: number, q: Params) {
  return q.lift * q.arch * 40 * g(u, 0.4, 0.14) * t ** 2
}

const params = computed<Params>(() => {
  const a1 = seg(2.15, 2.5)
  const a2 = seg(2.62, 2.92)
  const h1 = seg(2.3, 2.6)
  const h2 = seg(2.65, 2.95)
  return {
    lift: seg(2.0, 2.4),
    arch: lerp(lerp(0.3, 1, a1), 0.7, a2),
    heel: lerp(lerp(0, 1, h1), 0.5, h2),
  }
})

const NU = 44
const US = Array.from({ length: NU + 1 }, (_, i) => i / NU)
const poly = (pts: [number, number][], close = false) =>
  pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`).join('') + (close ? 'Z' : '')

/** Punto de la cara superior proyectado. */
const top = (u: number, t: number, q: Params): [number, number] => [
  px(u * L, yAt(u, t)),
  py(yAt(u, t), zTop(u, t, q)),
]
const low = (u: number, t: number, q: Params): [number, number] => [
  px(u * L, yAt(u, t)),
  py(yAt(u, t), zLow(u, t, q)),
]

/** Contorno en el plano (la huella): lateral de ida y medial de vuelta. */
const outlinePts = (f: (u: number, t: number) => [number, number]) => [
  ...US.map((u) => f(u, 0)),
  ...[...US].reverse().map((u) => f(u, 1)),
]
const footprintD = computed(() =>
  poly(
    outlinePts((u, t) => top(u, t, { lift: 0, arch: 0, heel: 0 })),
    true,
  ),
)
const rimD = computed(() =>
  poly(
    outlinePts((u, t) => top(u, t, params.value)),
    true,
  ),
)
/** Borde medial inferior (canto): baja desde la cara superior al extruir. */
const lowRimD = computed(() => {
  const w = seg(2.5, 2.85)
  const q = params.value
  return poly(
    US.map((u) => {
      const [x, y] = top(u, 1, q)
      const [, yl] = low(u, 1, q)
      return [x, lerp(y, yl, w)] as [number, number]
    }),
  )
})
/** Pared medial: polígono entre el borde superior y el inferior. */
const wallD = computed(() => {
  const w = seg(2.5, 2.85)
  const q = params.value
  const a = US.map((u) => top(u, 1, q))
  const b = [...US].reverse().map((u) => {
    const [x, y] = top(u, 1, q)
    const [, yl] = low(u, 1, q)
    return [x, lerp(y, yl, w)] as [number, number]
  })
  return poly([...a, ...b], true)
})

/** Secciones transversales: planas en el análisis (paso 02), se levantan en el diseño. */
const SECTIONS = Array.from({ length: 15 }, (_, i) => 0.07 + i * 0.062)
const sections = computed(() =>
  SECTIONS.map((u, i) => {
    const pts = Array.from({ length: 17 }, (_, j) => top(u, j / 16, params.value))
    return { d: poly(pts), k: i }
  }),
)
const sectionDraw = (k: number) => seg(1.1 + k * 0.035, 1.5 + k * 0.035)

/** Nervaduras: ranuras en el canto medial bajo el arco. */
const ribs = computed(() => {
  const q = params.value
  const w = seg(2.5, 2.85)
  const out: { d: string; k: number }[] = []
  for (let k = 0; k < 12; k++) {
    const u = 0.25 + k * 0.026
    const [x, y1] = top(u, 1, q)
    const [, yl] = low(u, 1, q)
    const y0 = y1 + 4
    const y2 = lerp(y1, yl, w) - 3
    if (y2 - y0 > 6) out.push({ d: `M${f1(x)} ${f1(y0)}V${f1(y2)}`, k })
  }
  return out
})
const ribShow = (k: number) => seg(2.7 + k * 0.02, 2.88 + k * 0.02)

/** Superficie sombreada (paso 04): rejilla de losetas ordenadas de lejos a cerca, luz desde arriba-izquierda. */
const shaded = computed(() => {
  if (p.value < 3) return []
  const q = params.value
  const NX = 26
  const NT = 10
  const Z = (u: number, t: number) => zTop(u, t, q)
  const tiles: { d: string; fill: string; depth: number }[] = []
  for (let i = 0; i < NX; i++) {
    for (let j = 0; j < NT; j++) {
      const u0 = i / NX
      const u1 = (i + 1) / NX
      const t0 = j / NT
      const t1 = (j + 1) / NT
      const um = (u0 + u1) / 2
      const tm = (t0 + t1) / 2
      if (halfWidth(um) < 1) continue
      // normal por diferencias finitas (en unidades de lienzo)
      const dzu = (Z(u1, tm) - Z(u0, tm)) / ((u1 - u0) * L)
      const wd = halfWidth(um) * 2
      const dzt = (Z(um, t1) - Z(um, t0)) / ((t1 - t0) * wd)
      const nl = Math.hypot(dzu, dzt, 1)
      const lit = clamp((-dzu * -0.55 + dzt * -0.45 + 1 * 0.75) / nl / 1.05)
      const shade = 0.18 + 0.82 * lit
      // de la tinta al cian claro
      const r = Math.round(lerp(8, 160, shade ** 1.2))
      const gC = Math.round(lerp(34, 232, shade ** 1.1))
      const b = Math.round(lerp(58, 246, shade))
      const pts = [top(u0, t0, q), top(u1, t0, q), top(u1, t1, q), top(u0, t1, q)]
      tiles.push({ d: poly(pts, true), fill: `rgb(${r} ${gC} ${b})`, depth: yAt(um, tm) })
    }
  }
  return tiles.sort((a, b) => a.depth - b.depth)
})

/** Puntos señalados por las anotaciones (en pantalla). */
const marks = computed(() => {
  const q = params.value
  return {
    arch: top(0.4, 0.9, q),
    cup: top(0.07, 0.12, q),
    rib: (() => {
      const [x, y] = top(0.31, 1, q)
      const [, yl] = low(0.31, 1, q)
      return [x, lerp(y, yl, seg(2.5, 2.85) * 0.5)] as [number, number]
    })(),
    heel: (() => {
      const [x, y] = top(0.03, 0.9, q)
      return [x, y + 6] as [number, number]
    })(),
  }
})

/** Huella de presión sobre el plano (paso 01): desigual al valorar. */
const blobs = [
  { u: 0.1, t: 0.5, rx: 52, ry: 44, col: '#e61a1a', o: 0.85 },
  { u: 0.4, t: 0.85, rx: 26, ry: 12, col: '#00bff2', o: 0.55 },
  { u: 0.8, t: 0.45, rx: 56, ry: 56, col: '#ffe61a', o: 0.75 },
]
const blobAt = (b: (typeof blobs)[number]) => ({
  cx: px(b.u * L, yAt(b.u, b.t)),
  cy: py(yAt(b.u, b.t), 0),
})

const v = computed(() => ({
  outline: seg(0.05, 0.65),
  blobs: seg(0.45, 1.0) * lerp(1, 0.25, seg(1.2, 1.5)) * (1 - seg(2.1, 2.4)),
  measure: seg(1.3, 1.8) * (1 - seg(2.0, 2.3)),
  zones: seg(1.5, 1.85) * (1 - seg(2.4, 2.7)),
  notes: [seg(2.55, 2.75), seg(2.62, 2.82), seg(2.7, 2.9), seg(2.76, 2.95)] as const,
  notesOut: 1 - seg(3.0, 3.2),
  fill: seg(3.0, 3.4),
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
          <svg viewBox="30 90 600 300" class="craft__svg" focusable="false">
            <defs>
              <linearGradient id="craft-wall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#14b8d4" stop-opacity="0.55" />
                <stop offset="1" stop-color="#061a2c" stop-opacity="0.9" />
              </linearGradient>
            </defs>

            <!-- 01 · Huella sobre el plano y reparto de la carga -->
            <g :style="{ opacity: v.blobs }">
              <ellipse
                v-for="b in blobs"
                :key="b.u"
                :cx="blobAt(b).cx"
                :cy="blobAt(b).cy"
                :rx="b.rx"
                :ry="b.ry * SP"
                :fill="b.col"
                :fill-opacity="b.o"
              />
            </g>
            <path
              class="k-line k-line--plan"
              :d="footprintD"
              pathLength="1"
              :style="{ strokeDashoffset: 1 - v.outline, opacity: 1 - seg(2.0, 2.4) * 0.7 }"
            />

            <!-- 02 · Medidas y zonas (en el plano) -->
            <g class="k-measure" :style="{ opacity: v.measure }">
              <path :d="`M${f1(px(0, 0) + 0)} ${f1(py(124, 0))}H${f1(px(L, 0) + K * 124)}`" />
              <path :d="`M${f1(px(0, 0))} ${f1(py(114, 0))}v10M${f1(px(L, 124))} ${f1(py(114, 0))}v10`" />
              <text class="k-note" :x="px(L / 2, 124)" :y="py(124, 0) + 16" text-anchor="middle">
                longitud
              </text>
              <path
                :d="`M${f1(px(L * 0.82, -112))} ${f1(py(-112, 0))}L${f1(px(L * 0.82, 112))} ${f1(py(112, 0))}`"
              />
              <text class="k-note" :x="px(L * 0.82, 112) + 8" :y="py(112, 0) + 34" text-anchor="start">
                ancho
              </text>
            </g>
            <g class="k-zones" :style="{ opacity: v.zones }">
              <text class="k-note" :x="px(L * 0.1, -86)" :y="py(-86, 0) - 6" text-anchor="middle">talón</text>
              <text class="k-note" :x="px(L * 0.4, -70)" :y="py(-70, 0) - 6" text-anchor="middle">arco</text>
              <text class="k-note" :x="px(L * 0.8, -104)" :y="py(-104, 0) - 6" text-anchor="middle">
                antepié
              </text>
            </g>

            <!-- Secciones: planas al medir, se levantan al diseñar -->
            <g class="k-sections">
              <path
                v-for="s in sections"
                :key="s.k"
                :d="s.d"
                pathLength="1"
                :style="{ strokeDashoffset: 1 - sectionDraw(s.k), opacity: 1 - v.fill * 0.65 }"
              />
            </g>

            <!-- 04 · Sombreado -->
            <g class="k-shade" :style="{ opacity: v.fill }">
              <path v-for="(t, i) in shaded" :key="i" :d="t.d" :fill="t.fill" :stroke="t.fill" />
            </g>

            <!-- 03 · Canto y nervaduras -->
            <path class="k-wall" :d="wallD" :style="{ opacity: seg(2.5, 2.85) }" />
            <g class="k-ribs">
              <path
                v-for="r in ribs"
                :key="r.k"
                :d="r.d"
                :style="{ opacity: ribShow(r.k) * (1 - v.fill * 0.3) }"
              />
            </g>
            <path
              class="k-line k-line--rim"
              :d="rimD"
              :class="{ 'is-final': v.fill > 0.02 }"
              :style="{ opacity: seg(2.0, 2.2) }"
            />
            <path class="k-line k-line--rim k-line--low" :d="lowRimD" :style="{ opacity: seg(2.5, 2.85) }" />

            <!-- Anotaciones de diseño, con flecha al punto que describen -->
            <g class="k-notes" :style="{ opacity: v.notesOut }">
              <g :style="{ opacity: v.notes[0] }">
                <path
                  :d="`M${f1(marks.cup[0] - 40)} 104Q${f1(marks.cup[0] - 40)} ${f1(marks.cup[1] - 30)} ${f1(marks.cup[0] - 3)} ${f1(marks.cup[1] - 3)}`"
                />
                <text class="k-note" :x="marks.cup[0] - 44" y="96" text-anchor="start">copa del talón</text>
              </g>
              <g :style="{ opacity: v.notes[1] }">
                <path :d="`M${f1(marks.arch[0])} 104V${f1(marks.arch[1] - 6)}`" />
                <path :d="`M${f1(marks.arch[0] - 5)} ${f1(marks.arch[1] - 12)}l5 6l5 -6`" />
                <text class="k-note" :x="marks.arch[0]" y="96" text-anchor="middle">
                  bóveda · arriba y abajo
                </text>
                <path
                  class="k-updown"
                  :d="`M${f1(marks.arch[0] + 22)} ${f1(marks.arch[1] + 4)}v22m-4 -17l4 -5l4 5m-8 12l4 5l4 -5`"
                />
              </g>
              <g :style="{ opacity: v.notes[2] }">
                <path
                  :d="`M${f1(marks.rib[0] + 70)} 352Q${f1(marks.rib[0] + 40)} 352 ${f1(marks.rib[0] + 6)} ${f1(marks.rib[1] + 2)}`"
                />
                <text class="k-note" :x="marks.rib[0] + 74" y="356" text-anchor="start">nervaduras</text>
              </g>
              <g :style="{ opacity: v.notes[3] }">
                <path
                  :d="`M${f1(marks.heel[0] - 18)} 336Q${f1(marks.heel[0] - 18)} 318 ${f1(marks.heel[0] - 2)} ${f1(marks.heel[1])}`"
                />
                <text class="k-note" :x="marks.heel[0] - 20" y="352" text-anchor="start">
                  elevación del talón
                </text>
              </g>
            </g>

            <!-- 04 · Entrega y revisión -->
            <g class="k-follow">
              <path
                d="M190 372H470"
                pathLength="1"
                :style="{ strokeDasharray: 1, strokeDashoffset: 1 - v.follow }"
              />
              <g :style="{ opacity: seg(3.45, 3.6) }">
                <circle cx="190" cy="372" r="5" />
                <text class="k-note" x="190" y="390" text-anchor="middle">entrega</text>
              </g>
              <g :style="{ opacity: seg(3.75, 3.95) }">
                <circle cx="470" cy="372" r="5" />
                <text class="k-note" x="470" y="390" text-anchor="middle">revisión</text>
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
.k-line,
.k-sections path,
.k-measure path,
.k-notes path,
.k-follow path {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.k-line {
  stroke: var(--color-bone);
  stroke-width: 1.8;
}
.k-line--plan {
  stroke-width: 1.4;
  stroke-opacity: 0.7;
  stroke-dasharray: 1;
}
.k-line--rim.is-final {
  stroke: var(--color-cyan);
}
.k-line--low {
  stroke-opacity: 0.8;
}
.k-sections path {
  stroke: var(--color-bone);
  stroke-opacity: 0.55;
  stroke-width: 1;
  stroke-dasharray: 1;
}
.k-measure path {
  stroke: var(--color-bone);
  stroke-opacity: 0.55;
  stroke-width: 1;
}
.k-wall {
  fill: url(#craft-wall);
  stroke: none;
}
.k-ribs path {
  fill: none;
  stroke: var(--color-ink);
  stroke-width: 4;
  stroke-linecap: round;
}
.k-shade path {
  stroke-width: 0.8;
  stroke-linejoin: round;
}
.k-notes path,
.k-follow path {
  stroke: var(--color-cyan);
  stroke-width: 1.4;
}
.k-updown {
  stroke-width: 1.4;
}
.k-note {
  fill: var(--color-bone);
  font-family: var(--font-display);
  font-size: 15px;
  font-style: italic;
  letter-spacing: 0.02em;
  opacity: 0.92;
}
.k-follow path {
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
    grid-column: 1 / span 4;
    gap: 2.5rem;
    min-height: 0;
  }
  .craft.is-live .craft__visual {
    grid-column: 5 / span 8;
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
  .craft__dot {
    transition: none;
  }
}
</style>
