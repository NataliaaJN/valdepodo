<script setup lang="ts">
/**
 * Fondos del hero (PRUEBAS). Cada variante es una atmósfera distinta pensada para sentarse detrás del
 * pie 3D y del titular oscuro: todas se mantienen claras y en la paleta cian/azul de marca.
 *
 *  - `seda`   · seda líquida: pliegues de cristal con luz especular (SVG feTurbulence + iluminación).
 *  - `aurora` · malla holográfica: manchas de color difuminadas que derivan despacio, con grano.
 *  - `puntos` · malla de puntos ondulante en perspectiva (canvas), como un campo de datos luminoso.
 *  - `fluido` · fluido de marca: seda en azul/cian saturado con cresta de luz.
 *
 * Todo lo animado es transform/opacity (o un canvas pausado fuera de pantalla) y se apaga con
 * reduced motion o en el nivel `static`.
 */
export type HeroBackdropVariant =
  | 'actual'
  | 'seda'
  | 'aurora'
  | 'puntos'
  | 'fluido'
  | 'seda-suave'
  | 'seda-perla'
  | 'fluido-suave'
  | 'fluido-bruma'
  | 'fluido-niebla'
  | 'fluido-hielo'
  | 'fluido-celeste'

const props = defineProps<{ variant: HeroBackdropVariant; animate?: boolean }>()

/** Familia (seda/fluido/…) y modificador (suave/perla/bruma) de la variante */
const family = computed(() => props.variant.split('-')[0] as string)
const modifier = computed(() => props.variant.split('-')[1] ?? '')
const isSilk = computed(() => family.value === 'seda' || family.value === 'fluido')

const uid = useId().replace(/[^a-z0-9]/gi, '')
const canvas = ref<HTMLCanvasElement | null>(null)
let stop: (() => void) | null = null

function startDots(el: HTMLCanvasElement) {
  const ctx = el.getContext('2d')
  if (!ctx) return () => {}
  let w = 0
  let h = 0
  let dpr = 1
  let raf = 0
  let visible = true
  const t0 = performance.now()

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75)
    w = el.clientWidth
    h = el.clientHeight
    el.width = Math.round(w * dpr)
    el.height = Math.round(h * dpr)
  }

  const COLS = 120
  const ROWS = 46
  const draw = (now: number) => {
    const t = props.animate ? (now - t0) / 1000 : 4
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    // Los puntos viven en la mitad inferior; en móvil, algo más arriba
    const horizon = h * 0.3
    const floor = h * 1.08
    for (let j = 0; j < ROWS; j++) {
      const z = j / (ROWS - 1) // 0 = lejos, 1 = cerca
      const persp = 0.28 + z * z * 1.25
      const rowY = horizon + (floor - horizon) * (z * z * 0.85 + z * 0.15)
      for (let i = 0; i < COLS; i++) {
        const u = i / (COLS - 1) - 0.5
        const wave =
          Math.sin(u * 5.2 + t * 0.55 + z * 3.4) * 0.55 +
          Math.sin(u * 2.3 - t * 0.35 + z * 6.1) * 0.45
        const lift = wave * (30 + z * 150) * (0.5 + z * 0.9)
        const x = w / 2 + u * w * 1.7 * persp
        const y = rowY - lift
        const crest = Math.max(0, wave) // las crestas brillan
        const a = (0.25 + z * 0.6) * (0.55 + crest * 0.75)
        const r = (0.8 + z * 2.4) * (0.8 + crest * 0.5)
        ctx.fillStyle = crest > 0.55 ? `rgb(255 255 255 / ${Math.min(a + 0.25, 0.95)})` : `rgb(18 112 182 / ${Math.min(a, 0.9)})`
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  const loop = (now: number) => {
    if (visible) draw(now)
    raf = requestAnimationFrame(loop)
  }

  resize()
  const ro = new ResizeObserver(() => {
    resize()
    if (!props.animate) draw(performance.now())
  })
  ro.observe(el)
  const io = new IntersectionObserver(([e]) => (visible = !!e?.isIntersecting))
  io.observe(el)

  if (props.animate) raf = requestAnimationFrame(loop)
  else draw(performance.now())

  return () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    io.disconnect()
  }
}

function sync() {
  stop?.()
  stop = null
  if (family.value === 'puntos' && canvas.value) stop = startDots(canvas.value)
}

onMounted(sync)
watch(() => [props.variant, props.animate], () => nextTick(sync))
onBeforeUnmount(() => stop?.())
</script>

<template>
  <div
    class="bd"
    :class="[`bd--${family}`, modifier && `bd--${modifier}`, { 'bd--animate': animate }]"
    aria-hidden="true"
  >
    <!-- SEDA y FLUIDO: pliegues de cristal con luz especular -->
    <template v-if="isSilk">
      <svg class="bd__silk" preserveAspectRatio="none">
        <defs>
          <filter :id="`silk-${uid}`" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
            <feTurbulence
              type="fractalNoise"
              :baseFrequency="family === 'fluido' ? '0.0013 0.0034' : '0.0016 0.0042'"
              numOctaves="2"
              :seed="family === 'fluido' ? (modifier === 'bruma' || modifier === 'niebla' || modifier === 'hielo' ? 23 : 11) : modifier === 'perla' ? 9 : 4"
              result="n"
            />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 3.4 -1.2" result="na" />
            <feGaussianBlur in="na" stdDeviation="10" result="nb" />
            <feDiffuseLighting in="nb" surfaceScale="9" diffuseConstant="1.05" lighting-color="#ffffff" result="d">
              <feDistantLight azimuth="235" elevation="46" />
            </feDiffuseLighting>
            <feSpecularLighting
              in="nb"
              surfaceScale="9"
              specularConstant="1.25"
              specularExponent="26"
              lighting-color="#ffffff"
              result="s"
            >
              <feDistantLight azimuth="235" elevation="46" />
            </feSpecularLighting>
            <feComposite in="s" in2="d" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="lit" />
            <feGaussianBlur in="lit" stdDeviation="2.2" />
          </filter>
        </defs>
        <rect width="100%" height="100%" :filter="`url(#silk-${uid})`" />
      </svg>
      <div class="bd__tint" />
    </template>

    <!-- AURORA: manchas difusas -->
    <template v-else-if="family === 'aurora'">
      <span class="bd__blob bd__blob--a" />
      <span class="bd__blob bd__blob--b" />
      <span class="bd__blob bd__blob--c" />
      <span class="bd__blob bd__blob--d" />
      <span class="bd__blob bd__blob--e" />
    </template>

    <!-- PUNTOS -->
    <template v-else-if="family === 'puntos'">
      <div class="bd__tint" />
      <canvas ref="canvas" class="bd__canvas" />
    </template>

    <div v-if="modifier" class="bd__clear" />
    <div v-if="variant !== 'actual'" class="bd__grain" />
    <div v-if="variant !== 'actual'" class="bd__vignette" />
  </div>
</template>

<style scoped>
.bd {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

/* ---------- Base por variante ---------- */
.bd--seda {
  background: linear-gradient(160deg, #eaf8fd 0%, #cfeefb 55%, #bfe3f6 100%);
}
.bd--fluido {
  background: linear-gradient(165deg, #8ccaf5 0%, #4f8fe6 50%, #5b5fd6 100%);
}
.bd--aurora {
  background: linear-gradient(180deg, #eef9fe 0%, #dff2fc 100%);
}
.bd--puntos {
  background: linear-gradient(180deg, #eef9fe 0%, #d3effb 55%, #b9e1f5 100%);
}

/* ---------- Seda / fluido ---------- */
.bd__silk {
  position: absolute;
  inset: -30%;
  width: 160%;
  height: 160%;
  rotate: -16deg;
  mix-blend-mode: soft-light;
  opacity: 1;
}
.bd--fluido .bd__silk {
  mix-blend-mode: overlay;
  opacity: 1;
}
.bd--animate .bd__silk {
  animation: silk-drift 38s ease-in-out infinite alternate;
}
@keyframes silk-drift {
  from {
    transform: translate3d(-3%, -1%, 0) scale(1.02);
  }
  to {
    transform: translate3d(3%, 2%, 0) scale(1.08);
  }
}
.bd__tint {
  position: absolute;
  inset: 0;
}
.bd--seda .bd__silk {
  mix-blend-mode: overlay;
  opacity: 0.9;
}
.bd--seda .bd__tint {
  background:
    radial-gradient(60% 70% at 8% 0%, rgb(255 255 255 / 0.85), rgb(255 255 255 / 0) 65%),
    radial-gradient(55% 60% at 100% 100%, rgb(18 112 182 / 0.35), rgb(18 112 182 / 0) 70%),
    radial-gradient(40% 40% at 70% 30%, rgb(30 171 225 / 0.25), rgb(30 171 225 / 0) 70%);
}
.bd--fluido .bd__tint {
  background:
    radial-gradient(50% 60% at 78% 45%, rgb(255 255 255 / 0.5), rgb(255 255 255 / 0) 70%),
    radial-gradient(60% 50% at 0% 100%, rgb(160 190 255 / 0.55), rgb(160 190 255 / 0) 70%),
    radial-gradient(50% 50% at 10% 0%, rgb(210 240 255 / 0.85), rgb(210 240 255 / 0) 70%);
}

/* ---------- Aurora ---------- */
.bd__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(64px);
  will-change: transform;
}
.bd__blob--a {
  top: -22%;
  left: -12%;
  width: 62vw;
  height: 62vw;
  background: radial-gradient(circle, #7fd2f6 0%, rgb(127 210 246 / 0) 68%);
}
.bd__blob--b {
  right: -14%;
  bottom: -30%;
  width: 70vw;
  height: 70vw;
  background: radial-gradient(circle, #a9b6ff 0%, rgb(169 182 255 / 0) 66%);
}
.bd__blob--c {
  top: 8%;
  right: 12%;
  width: 46vw;
  height: 46vw;
  background: radial-gradient(circle, #ffffff 0%, rgb(255 255 255 / 0) 66%);
}
.bd__blob--d {
  bottom: -26%;
  left: 14%;
  width: 52vw;
  height: 52vw;
  background: radial-gradient(circle, #1eabe1 0%, rgb(30 171 225 / 0) 66%);
  opacity: 0.7;
}
.bd__blob--e {
  top: 30%;
  left: 38%;
  width: 34vw;
  height: 34vw;
  background: radial-gradient(circle, #f6c8ee 0%, rgb(246 200 238 / 0) 66%);
  opacity: 0.75;
}
.bd--animate .bd__blob--a {
  animation: drift-a 26s ease-in-out infinite alternate;
}
.bd--animate .bd__blob--b {
  animation: drift-b 32s ease-in-out infinite alternate;
}
.bd--animate .bd__blob--c {
  animation: drift-a 22s ease-in-out infinite alternate-reverse;
}
.bd--animate .bd__blob--d {
  animation: drift-b 28s ease-in-out infinite alternate-reverse;
}
.bd--animate .bd__blob--e {
  animation: drift-a 36s ease-in-out infinite alternate;
}
@keyframes drift-a {
  to {
    transform: translate3d(9vw, 6vh, 0) scale(1.15);
  }
}
@keyframes drift-b {
  to {
    transform: translate3d(-8vw, -7vh, 0) scale(0.92);
  }
}

/* ---------- Puntos ---------- */
.bd--puntos .bd__tint {
  background:
    radial-gradient(60% 70% at 10% 0%, rgb(255 255 255 / 0.8), rgb(255 255 255 / 0) 65%),
    radial-gradient(50% 50% at 90% 90%, rgb(120 140 255 / 0.3), rgb(120 140 255 / 0) 70%);
}
.bd__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* ---------- Grano y viñeta comunes ---------- */
.bd__grain {
  position: absolute;
  inset: 0;
  opacity: 0.22;
  mix-blend-mode: soft-light;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 1.4 -.2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
}
/* Aclara la zona del titular (izquierda) para asegurar el contraste del texto oscuro */
.bd__vignette {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgb(238 249 254 / 0.55) 0%, rgb(238 249 254 / 0) 55%);
}
.bd--fluido .bd__vignette {
  background: linear-gradient(90deg, rgb(238 249 254 / 0.78) 0%, rgb(238 249 254 / 0) 62%);
}

/* ---------- Variantes sutiles: zona del modelo despejada ---------- */
/* La seda se enmascara con un hueco en el centro del pie (derecha) y queda en bordes y esquinas */
.bd--suave .bd__silk,
.bd--celeste .bd__silk,
.bd--perla .bd__silk,
.bd--bruma .bd__silk,
.bd--niebla .bd__silk,
.bd--hielo .bd__silk {
  -webkit-mask-image: radial-gradient(ellipse 34% 42% at 74% 48%, transparent 0%, #000 100%);
  mask-image: radial-gradient(ellipse 34% 42% at 74% 48%, transparent 0%, #000 100%);
}
.bd__clear {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 36% 46% at 74% 48%, rgb(255 255 255 / 0.62), rgb(255 255 255 / 0) 100%);
}

.bd--seda.bd--suave .bd__silk {
  opacity: 0.55;
}
.bd--seda.bd--suave .bd__tint {
  opacity: 0.8;
}

/* Perla: casi blanca, con un velo de lila y rosa; la seda solo asoma por abajo-izquierda */
.bd--seda.bd--perla {
  background: linear-gradient(150deg, #f6fbff 0%, #e4f3fc 50%, #e9e6fb 100%);
}
.bd--seda.bd--perla .bd__silk {
  opacity: 0.6;
  -webkit-mask-image:
    radial-gradient(ellipse 34% 42% at 74% 48%, transparent 0%, #000 100%),
    linear-gradient(20deg, #000 0%, rgb(0 0 0 / 0.15) 55%, transparent 80%);
  -webkit-mask-composite: source-in;
  mask-image:
    radial-gradient(ellipse 34% 42% at 74% 48%, transparent 0%, #000 100%),
    linear-gradient(20deg, #000 0%, rgb(0 0 0 / 0.15) 55%, transparent 80%);
  mask-composite: intersect;
}
.bd--seda.bd--perla .bd__tint {
  background:
    radial-gradient(45% 55% at 100% 0%, rgb(246 200 238 / 0.45), rgb(246 200 238 / 0) 70%),
    radial-gradient(55% 60% at 0% 100%, rgb(30 171 225 / 0.3), rgb(30 171 225 / 0) 70%);
}

/* Fluido suave: mismo fluido, pero pálido y con menos contraste */
.bd--fluido.bd--suave,
.bd--fluido.bd--celeste {
  background: linear-gradient(165deg, #c9e8fb 0%, #9fc6f3 55%, #a9a8ee 100%);
}
.bd--fluido.bd--suave .bd__silk,
.bd--fluido.bd--celeste .bd__silk {
  opacity: 0.7;
}

/* Fluido bruma: color pleno solo en los bordes; el centro se desvanece en bruma clara */
.bd--fluido.bd--bruma {
  background: linear-gradient(165deg, #8ccaf5 0%, #5f98ea 50%, #6a66dc 100%);
}
.bd--fluido.bd--bruma .bd__clear {
  background: radial-gradient(ellipse 48% 62% at 72% 48%, rgb(240 249 255 / 0.9), rgb(240 249 255 / 0) 100%);
}

/* Fluido niebla: como fluido-bruma, con el azul mucho menos intenso */
.bd--fluido.bd--niebla,
.bd--fluido.bd--hielo {
  background: linear-gradient(165deg, #b4def8 0%, #9cc3f1 50%, #a7a6ee 100%);
}
.bd--fluido.bd--niebla .bd__clear {
  background: radial-gradient(ellipse 48% 62% at 72% 48%, rgb(240 249 255 / 0.9), rgb(240 249 255 / 0) 100%);
}

/* Fluido hielo: copia de fluido-niebla con un cian muy muy claro donde antes había blanco */
.bd--fluido.bd--hielo .bd__tint {
  background:
    radial-gradient(50% 60% at 78% 45%, rgb(224 250 255 / 0.5), rgb(224 250 255 / 0) 70%),
    radial-gradient(60% 50% at 0% 100%, rgb(160 190 255 / 0.55), rgb(160 190 255 / 0) 70%),
    radial-gradient(50% 50% at 10% 0%, rgb(224 250 255 / 0.85), rgb(224 250 255 / 0) 70%);
}
.bd--fluido.bd--hielo .bd__clear {
  background: radial-gradient(ellipse 48% 62% at 72% 48%, rgb(224 250 255 / 0.9), rgb(224 250 255 / 0) 100%);
}
.bd--fluido.bd--hielo .bd__vignette {
  background: linear-gradient(90deg, rgb(224 250 255 / 0.78) 0%, rgb(224 250 255 / 0) 62%);
}

/* Fluido celeste: igual que fluido-suave, con un cian muy muy clarito donde antes había blanco */
.bd--fluido.bd--celeste .bd__tint {
  background:
    radial-gradient(50% 60% at 78% 45%, rgb(224 250 255 / 0.5), rgb(224 250 255 / 0) 70%),
    radial-gradient(60% 50% at 0% 100%, rgb(160 190 255 / 0.55), rgb(160 190 255 / 0) 70%),
    radial-gradient(50% 50% at 10% 0%, rgb(224 250 255 / 0.85), rgb(224 250 255 / 0) 70%);
}
.bd--fluido.bd--celeste .bd__clear {
  background: radial-gradient(ellipse 36% 46% at 74% 48%, rgb(224 250 255 / 0.62), rgb(224 250 255 / 0) 100%);
}
.bd--fluido.bd--celeste .bd__vignette {
  background: linear-gradient(90deg, rgb(224 250 255 / 0.78) 0%, rgb(224 250 255 / 0) 62%);
}
</style>
