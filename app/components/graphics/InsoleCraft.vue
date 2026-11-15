<script setup lang="ts">
/**
 * «Cómo hacemos tus plantillas» — experiencia de Plantillas personalizadas. Capítulo tinta fijado (`pin`): el
 * scroll es el proceso. Un único modelo paramétrico de plantilla se dibuja a mano a lo largo de los cuatro pasos
 * de `insoleProcess`, y la cámara hace el camino que haría un diseñador: de la planta a la perspectiva.
 *   01 Valoración   → vista en planta: tu huella (con dedos) y su mapa de presión, desigual.
 *   02 Análisis     → sobre la misma huella se acota el contorno y se nombran talón, arco y antepié.
 *   03 Diseño       → la cámara se inclina y las secciones se levantan: arco, copa y elevación del talón; se
 *                     extruye el canto y se abren las nervaduras. Tres deslizadores muestran cómo viajan los
 *                     parámetros (arriba, abajo, punto medio): no es una forma fija.
 *   04 Entrega      → se sombrea como un render y se marcan la entrega y la revisión.
 *
 * - Un único `p` (0 … N) lo mueve ScrollTrigger con `scrub`; todo el dibujo sale de él, así que al volver atrás
 *   se deshace solo. Los puntos de la barra saltan a cada paso (botones accesibles con teclado).
 * - Reduced motion y sin JS: sin pin; lista de pasos y el dibujo terminado.
 * - Metáfora visual: no representa un proceso de fabricación ni un producto concreto (spec 04 §2.2).
 */
import { gsap } from 'gsap'
import { insoleProcess } from '~/data/insole'

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
  [0.92, 86],
  [0.97, 78],
  [0.995, 48],
  [1, 0],
]
function baseWidth(u: number) {
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
/** Talón y puntera se cierran en elipse (tangente vertical), no en pico. */
const END = 0.07
function halfWidth(u: number) {
  if (u < END) return baseWidth(END) * Math.sqrt(Math.max(0, 1 - ((END - u) / END) ** 2))
  if (u > 1 - END) return baseWidth(1 - END) * Math.sqrt(Math.max(0, 1 - ((u - (1 - END)) / END) ** 2))
  return baseWidth(u)
}
/** t = 0 borde lateral · t = 1 borde medial (el que mira al espectador, con el arco). */
const yAt = (u: number, t: number) => {
  const w = halfWidth(u)
  const med = w - 16 * g(u, 0.42, 0.13)
  return -w + t * (w + med)
}

/**
 * Cámara: de la planta (90°) a una perspectiva oblicua (36°). X a la derecha, Y hacia el espectador, Z arriba.
 * `sp` y `cp` reparten Y y Z en la vertical de la pantalla; `k` inclina el eje Y hacia la derecha (oblicua).
 */
const OX = 62
const OY = 262
const cam = computed(() => {
  const tilt = seg(2.0, 2.65)
  const a = (lerp(90, 36, tilt) * Math.PI) / 180
  return { sp: Math.sin(a), cp: Math.cos(a), k: 0.42 * tilt }
})
const px = (X: number, Y: number) => OX + X + cam.value.k * Y
const py = (Y: number, Z: number) => OY + cam.value.sp * Y - cam.value.cp * Z
const f1 = (n: number) => n.toFixed(1)

interface Params {
  lift: number
  arch: number
  heel: number
  cup: number
}
/** Altura de la cara superior y de la inferior (hueca bajo el arco) en (u, t). */
function zTop(u: number, t: number, q: Params) {
  const med = t ** 1.6
  const edge = (2 * t - 1) ** 2
  const arch = q.arch * 70 * g(u, 0.4, 0.15) * med
  const cup = q.cup * 26 * g(u, 0.1, 0.13) * edge
  const fore = 7 * g(u, 0.78, 0.18)
  const raise = q.heel * 22 * (1 - sstep(0.04, 0.5, u))
  return q.lift * (12 + arch + cup + fore + raise)
}
function zLow(u: number, t: number, q: Params) {
  return q.lift * q.arch * 46 * g(u, 0.4, 0.14) * t ** 2
}

const params = computed<Params>(() => {
  const a1 = seg(2.15, 2.5)
  const a2 = seg(2.62, 2.92)
  const h1 = seg(2.3, 2.6)
  const h2 = seg(2.65, 2.95)
  const c1 = seg(2.2, 2.55)
  const c2 = seg(2.7, 2.95)
  return {
    lift: seg(2.05, 2.5),
    arch: lerp(lerp(0.3, 1, a1), 0.7, a2),
    heel: lerp(lerp(0, 1, h1), 0.5, h2),
    cup: lerp(lerp(0.55, 1, c1), 0.8, c2),
  }
})
const FLAT: Params = { lift: 0, arch: 0, heel: 0, cup: 0 }

const NU = 64
const cosU = (i: number, n: number) => (1 - Math.cos((Math.PI * i) / n)) / 2
const US = Array.from({ length: NU + 1 }, (_, i) => cosU(i, NU))
const poly = (pts: [number, number][], close = false) =>
  pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`).join('') + (close ? 'Z' : '')

/** Curva suave por los puntos (Catmull-Rom convertido a Bézier). `lead` = 'L' continúa un trazo previo. */
function smooth(pts: [number, number][], close = false, lead: 'M' | 'L' = 'M') {
  const n = pts.length
  const at = (i: number) => (close ? pts[(i + n) % n]! : pts[Math.min(n - 1, Math.max(0, i))]!)
  let d = `${lead}${f1(pts[0]![0])} ${f1(pts[0]![1])}`
  for (let i = 0; i < (close ? n : n - 1); i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`
  }
  return close ? d + 'Z' : d
}

/** Puntos de la cara superior / inferior proyectados. */
const top = (u: number, t: number, q: Params): [number, number] => [
  px(u * L, yAt(u, t)),
  py(yAt(u, t), zTop(u, t, q)),
]
const low = (u: number, t: number, q: Params): [number, number] => [
  px(u * L, yAt(u, t)),
  py(yAt(u, t), zLow(u, t, q)),
]

/** Contorno: lateral de ida y medial de vuelta. */
const outlinePts = (f: (u: number, t: number) => [number, number]) => [
  ...US.map((u) => f(u, 0)),
  ...[...US]
    .reverse()
    .slice(1, -1)
    .map((u) => f(u, 1)),
]
const footprintD = computed(() =>
  smooth(
    outlinePts((u, t) => top(u, t, FLAT)),
    true,
  ),
)
const rimD = computed(() =>
  smooth(
    outlinePts((u, t) => top(u, t, params.value)),
    true,
  ),
)

/** Borde medial inferior (canto): baja desde la cara superior al extruir. */
const wallProgress = () => seg(2.55, 2.9)
const lowRimPts = computed(() => {
  const w = wallProgress()
  const q = params.value
  return US.map((u) => {
    const [x, y] = top(u, 1, q)
    const [, yl] = low(u, 1, q)
    return [x, lerp(y, yl, w)] as [number, number]
  })
})
const lowRimD = computed(() => smooth(lowRimPts.value))
const wallD = computed(() => {
  const q = params.value
  return `${smooth(US.map((u) => top(u, 1, q)))}${smooth([...lowRimPts.value].reverse(), false, 'L')}Z`
})

/** Secciones transversales: planas en el análisis (paso 02), se levantan en el diseño. */
const SECTIONS = Array.from({ length: 15 }, (_, i) => 0.07 + i * 0.062)
const sections = computed(() =>
  SECTIONS.map((u, i) => {
    const pts = Array.from({ length: 17 }, (_, j) => top(u, j / 16, params.value))
    return { d: smooth(pts), k: i }
  }),
)
const sectionDraw = (k: number) => seg(1.1 + k * 0.035, 1.5 + k * 0.035)

/** Nervaduras: ranuras en el canto medial bajo el arco. */
const ribs = computed(() => {
  const q = params.value
  const w = wallProgress()
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
const ribShow = (k: number) => seg(2.75 + k * 0.02, 2.92 + k * 0.02)

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
      const u0 = cosU(i, NX)
      const u1 = cosU(i + 1, NX)
      const t0 = j / NT
      const t1 = (j + 1) / NT
      const um = (u0 + u1) / 2
      const tm = (t0 + t1) / 2
      if (halfWidth(um) < 1) continue
      const dzu = (Z(u1, tm) - Z(u0, tm)) / ((u1 - u0) * L)
      const wd = halfWidth(um) * 2
      const dzt = (Z(um, t1) - Z(um, t0)) / ((t1 - t0) * wd)
      const nl = Math.hypot(dzu, dzt, 1)
      const lit = clamp((dzu * 0.55 - dzt * 0.45 + 0.75) / nl / 1.05)
      const shade = 0.18 + 0.82 * lit
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
  const [rx, ry] = top(0.31, 1, q)
  const [, ryl] = low(0.31, 1, q)
  const [hx, hy] = top(0.03, 0.9, q)
  return {
    arch: top(0.4, 0.9, q),
    cup: top(0.07, 0.12, q),
    rib: [rx, lerp(ry, ryl, wallProgress() * 0.5)] as [number, number],
    heel: [hx, hy + 6] as [number, number],
  }
})

/**
 * Huella (paso 01): planta del pie (la plantilla menos un margen, con el antepié cerrado en curva), dedos como
 * almohadillas y mapa de presión desigual. Coordenadas del plano (X a lo largo, Y a lo ancho; + = lado medial).
 */
const SOLE_END = 0.82
const SOLE_MARGIN = 9
const soleD = computed(() => {
  const us = US.filter((u) => u >= 0.02 && u <= SOLE_END)
  const lat = us.map((u) => [u * L, yAt(u, 0) + SOLE_MARGIN] as [number, number])
  const med = [...us].reverse().map((u) => [u * L, yAt(u, 1) - SOLE_MARGIN] as [number, number])
  const yl = lat[lat.length - 1]![1]
  const ym = med[0]![1]
  const front = Array.from({ length: 9 }, (_, i) => {
    const a = (i + 1) / 10
    const y = lerp(yl, ym, a)
    return [SOLE_END * L + 34 * Math.sin(Math.PI * a) ** 0.7, y] as [number, number]
  })
  const heel = Array.from({ length: 9 }, (_, i) => {
    const t = (i + 1) / 10
    const y = lerp(med[med.length - 1]![1], lat[0]![1], t)
    return [us[0]! * L - 6 * Math.sin(Math.PI * t) ** 0.7, y] as [number, number]
  })
  const pts = [...lat, ...front, ...med, ...heel].map(([X, Y]) => [px(X, Y), py(Y, 0)] as [number, number])
  return smooth(pts, true)
})
const TOES = [
  { x: 466, y: 38, rx: 21, ry: 19 },
  { x: 474, y: 4, rx: 13.5, ry: 12.5 },
  { x: 468, y: -20, rx: 12, ry: 11 },
  { x: 455, y: -40, rx: 10.5, ry: 10 },
  { x: 440, y: -56, rx: 9.5, ry: 9 },
]
const toeAt = (t: (typeof TOES)[number]) => ({
  cx: px(t.x, t.y),
  cy: py(t.y, 0),
  rx: t.rx,
  ry: t.ry * cam.value.sp,
})
const BLOBS = [
  { x: 56, y: 0, rx: 64, ry: 56, grad: 'hot' },
  { x: 380, y: 48, rx: 50, ry: 50, grad: 'warm' },
  { x: 372, y: -48, rx: 38, ry: 40, grad: 'cool' },
  { x: 205, y: -34, rx: 54, ry: 18, grad: 'cool' },
  { x: 300, y: 24, rx: 30, ry: 12, grad: 'low' },
  { x: 466, y: 38, rx: 28, ry: 25, grad: 'warm' },
  { x: 474, y: 4, rx: 17, ry: 15, grad: 'cool' },
] as const
const blobAt = (b: (typeof BLOBS)[number]) => ({
  cx: px(b.x, b.y),
  cy: py(b.y, 0),
  rx: b.rx,
  ry: b.ry * cam.value.sp,
})
/** Notas del paso 01: flecha a los puntos de mayor y menor carga. */
const loadNotes = computed(() => {
  const a = { x: px(-6, -122), y: py(-122, 0) }
  const b = { x: px(210, 122), y: py(122, 0) }
  return {
    hi: {
      tx: a.x,
      ty: a.y,
      d: `M${f1(a.x + 34)} ${f1(a.y + 8)}Q${f1(a.x + 52)} ${f1(py(-60, 0) - 6)} ${f1(px(48, -30))} ${f1(py(-30, 0))}`,
    },
    lo: {
      tx: b.x,
      ty: b.y,
      d: `M${f1(b.x + 40)} ${f1(b.y - 18)}Q${f1(px(280, 90))} ${f1(py(70, 0))} ${f1(px(296, 30))} ${f1(py(30, 0))}`,
    },
  }
})

/** Etiquetas de zona del análisis: sobre el borde lateral de cada zona. */
const ZONES = [
  { u: 0.1, label: 'talón' },
  { u: 0.4, label: 'arco' },
  { u: 0.8, label: 'antepié' },
]
const zoneAt = (z: (typeof ZONES)[number]) => ({
  x: px(z.u * L, -halfWidth(z.u) - 20),
  y: py(-halfWidth(z.u) - 20, 0),
})
/** Deslizadores del diseño: viajan con los parámetros. */
const sliders = computed(() => [
  { label: 'arco', x: 70, v: (params.value.arch - 0.3) / 0.7 },
  { label: 'talón', x: 250, v: params.value.heel },
  { label: 'copa', x: 430, v: (params.value.cup - 0.55) / 0.45 },
])

const v = computed(() => ({
  sole: seg(0.05, 0.6),
  soleFade: lerp(1, 0.3, seg(1.0, 1.4)) * (1 - seg(2.1, 2.4)),
  outline: seg(1.05, 1.5),
  toes: seg(0.2, 0.7) * lerp(1, 0.35, seg(1.0, 1.3)) * (1 - seg(2.1, 2.4)),
  blobs: seg(0.4, 0.95) * lerp(1, 0.25, seg(1.2, 1.5)) * (1 - seg(2.1, 2.4)),
  load: seg(0.65, 0.95) * (1 - seg(1.1, 1.3)),
  zones: seg(1.5, 1.85) * (1 - seg(2.2, 2.5)),
  notes: [seg(2.6, 2.78), seg(2.66, 2.84), seg(2.72, 2.9), seg(2.78, 2.96)] as const,
  notesOut: 1 - seg(3.0, 3.2),
  sliders: seg(2.5, 2.75) * (1 - seg(3.0, 3.2)),
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
          <svg viewBox="30 70 600 350" class="craft__svg" focusable="false">
            <defs>
              <linearGradient id="craft-wall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#14b8d4" stop-opacity="0.55" />
                <stop offset="1" stop-color="#061a2c" stop-opacity="0.9" />
              </linearGradient>
              <radialGradient id="craft-hot">
                <stop offset="0" stop-color="#e61a1a" stop-opacity="0.95" />
                <stop offset="0.4" stop-color="#ff8010" stop-opacity="0.7" />
                <stop offset="0.75" stop-color="#ffe61a" stop-opacity="0.3" />
                <stop offset="1" stop-color="#ffe61a" stop-opacity="0" />
              </radialGradient>
              <radialGradient id="craft-warm">
                <stop offset="0" stop-color="#ffe61a" stop-opacity="0.9" />
                <stop offset="0.55" stop-color="#7ddc30" stop-opacity="0.5" />
                <stop offset="1" stop-color="#33d940" stop-opacity="0" />
              </radialGradient>
              <radialGradient id="craft-cool">
                <stop offset="0" stop-color="#33d940" stop-opacity="0.75" />
                <stop offset="0.6" stop-color="#00bff2" stop-opacity="0.35" />
                <stop offset="1" stop-color="#00bff2" stop-opacity="0" />
              </radialGradient>
              <radialGradient id="craft-low">
                <stop offset="0" stop-color="#1a33d9" stop-opacity="0.8" />
                <stop offset="1" stop-color="#1a33d9" stop-opacity="0" />
              </radialGradient>
            </defs>

            <!-- 01 · Huella: planta, dedos y mapa de presión -->
            <g :style="{ opacity: v.soleFade }">
              <path
                class="k-sole"
                :d="soleD"
                pathLength="1"
                :style="{ strokeDashoffset: 1 - v.sole, fillOpacity: v.sole * 0.07 }"
              />
              <g class="k-toes" :style="{ opacity: v.toes }">
                <ellipse v-for="(t, i) in TOES" :key="i" v-bind="toeAt(t)" />
              </g>
            </g>
            <clipPath id="craft-sole-clip">
              <path :d="soleD" />
              <ellipse v-for="(t, i) in TOES" :key="i" v-bind="toeAt(t)" />
            </clipPath>
            <g clip-path="url(#craft-sole-clip)" :style="{ opacity: v.blobs }">
              <ellipse v-for="(b, i) in BLOBS" :key="i" v-bind="blobAt(b)" :fill="`url(#craft-${b.grad})`" />
            </g>
            <g class="k-notes" :style="{ opacity: v.load }">
              <path :d="loadNotes.hi.d" />
              <text class="k-note" :x="loadNotes.hi.tx" :y="loadNotes.hi.ty">mayor carga</text>
              <path :d="loadNotes.lo.d" />
              <text class="k-note" :x="loadNotes.lo.tx" :y="loadNotes.lo.ty + 4">menor carga</text>
            </g>
            <path
              class="k-line k-line--plan"
              :d="footprintD"
              pathLength="1"
              :style="{ strokeDashoffset: 1 - v.outline, opacity: 1 - seg(2.0, 2.4) * 0.7 }"
            />

            <!-- 02 · Medidas y zonas, sobre la misma huella -->
            <g class="k-zones" :style="{ opacity: v.zones }">
              <text
                v-for="z in ZONES"
                :key="z.label"
                class="k-note"
                :x="zoneAt(z).x"
                :y="zoneAt(z).y"
                text-anchor="middle"
              >
                {{ z.label }}
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
            <path class="k-wall" :d="wallD" :style="{ opacity: wallProgress() }" />
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
            <path class="k-line k-line--rim k-line--low" :d="lowRimD" :style="{ opacity: wallProgress() }" />

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
                <text class="k-note" :x="marks.arch[0] - 30" y="96" text-anchor="start">
                  bóveda · arriba y abajo
                </text>
                <path
                  class="k-updown"
                  :d="`M${f1(marks.arch[0] + 22)} ${f1(marks.arch[1] + 4)}v22m-4 -17l4 -5l4 5m-8 12l4 5l4 -5`"
                />
              </g>
              <g :style="{ opacity: v.notes[2] }">
                <path
                  :d="`M${f1(marks.rib[0] + 70)} 350Q${f1(marks.rib[0] + 40)} 350 ${f1(marks.rib[0] + 6)} ${f1(marks.rib[1] + 2)}`"
                />
                <text class="k-note" :x="marks.rib[0] + 74" y="354" text-anchor="start">nervaduras</text>
              </g>
              <g :style="{ opacity: v.notes[3] }">
                <path
                  :d="`M${f1(marks.heel[0] - 18)} 334Q${f1(marks.heel[0] - 18)} 316 ${f1(marks.heel[0] - 2)} ${f1(marks.heel[1])}`"
                />
                <text class="k-note" :x="marks.heel[0] - 20" y="350" text-anchor="start">
                  elevación del talón
                </text>
              </g>
            </g>

            <!-- 03 · Parámetros: viajan arriba y abajo mientras se diseña -->
            <g class="k-sliders" :style="{ opacity: v.sliders }">
              <g v-for="s in sliders" :key="s.label">
                <text class="k-note k-note--small" :x="s.x" y="388">{{ s.label }}</text>
                <path :d="`M${s.x} 402H${s.x + 140}`" />
                <circle :cx="s.x + 140 * clamp(s.v)" cy="402" r="6" />
              </g>
            </g>

            <!-- 04 · Entrega y revisión -->
            <g class="k-follow">
              <path
                d="M190 394H470"
                pathLength="1"
                :style="{ strokeDasharray: 1, strokeDashoffset: 1 - v.follow }"
              />
              <g :style="{ opacity: seg(3.45, 3.6) }">
                <circle cx="190" cy="394" r="5" />
                <text class="k-note" x="190" y="414" text-anchor="middle">entrega</text>
              </g>
              <g :style="{ opacity: seg(3.75, 3.95) }">
                <circle cx="470" cy="394" r="5" />
                <text class="k-note" x="470" y="414" text-anchor="middle">revisión</text>
              </g>
            </g>
          </svg>
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

/* ---------- Trazos del boceto ---------- */
.k-line,
.k-sections path,
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
.k-sole {
  fill: rgb(241 239 233 / 1);
  fill-opacity: 0.05;
  stroke: var(--color-bone);
  stroke-opacity: 0.85;
  stroke-width: 1.6;
  stroke-linejoin: round;
  stroke-dasharray: 1;
}
.k-toes ellipse {
  fill: rgb(241 239 233 / 0.05);
  stroke: var(--color-bone);
  stroke-opacity: 0.55;
  stroke-width: 1.2;
}
.k-sliders path {
  fill: none;
  stroke: var(--color-bone);
  stroke-opacity: 0.4;
  stroke-width: 2;
  stroke-linecap: round;
}
.k-sliders circle {
  fill: var(--color-cyan);
}
.k-note.k-note--small {
  font-size: 14px;
}
.k-note {
  fill: var(--color-bone);
  font-family: var(--font-display);
  font-size: 17px;
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

/* Móvil: el lienzo se reduce a ~0,55×; las notas suben de tamaño para seguir leyéndose */
@media (max-width: 767px) {
  .k-note {
    font-size: 22px;
  }
  .k-note.k-note--small {
    font-size: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .craft__item,
  .craft__dot {
    transition: none;
  }
}
</style>
