<script setup lang="ts">
/**
 * Contorno lateral del pie con ejes articulares y arcos de movilidad (fase 01 del estudio, spec 04 §1.3).
 * `<g>` en coordenadas propias (360 × 240, suelo en y = 214). Esquema simplificado y SIN etiquetas
 * anatómicas: cualquier rótulo o precisión anatómica debe revisarlo la podóloga (spec 01 §7).
 * Con `active`, una silueta fantasma oscila alrededor del tobillo y los arcos se dibujan.
 */
withDefaults(defineProps<{ active?: boolean }>(), { active: true })

const uid = useId()

/** Pierna + pie (abierto arriba, donde la pierna se funde). Pie derecho visto por fuera, dedos a la derecha. */
const LEG_FOOT =
  'M70 0C68 44 66 88 68 112C69 130 52 148 44 168C36 188 44 207 70 210L120 210C150 210 170 205 200 206' +
  'C230 207 250 210 280 210L326 210C340 210 345 199 338 193C326 186 304 188 286 180C262 170 230 152 200 136' +
  'C176 124 150 120 142 106C136 88 134 40 134 0'

/** Solo el pie (bajo el tobillo), para la silueta fantasma que gira. */
const FOOT_ONLY =
  'M142 106C150 120 176 124 200 136C230 152 262 170 286 180C304 188 326 186 338 193C345 199 340 210 326 210' +
  'L280 210C250 210 230 207 200 206C170 205 150 210 120 210L70 210C44 207 36 188 44 168C52 148 69 130 68 112' +
  'C92 104 122 100 142 106Z'

const ANKLE = { x: 100, y: 140 }
const JOINTS = [ANKLE, { x: 94, y: 174 }, { x: 170, y: 170 }, { x: 282, y: 196 }]

function arc(cx: number, cy: number, r: number, fromDeg: number, toDeg: number) {
  const rad = (d: number) => (d * Math.PI) / 180
  const a = { x: cx + r * Math.cos(rad(fromDeg)), y: cy + r * Math.sin(rad(fromDeg)) }
  const b = { x: cx + r * Math.cos(rad(toDeg)), y: cy + r * Math.sin(rad(toDeg)) }
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)}A${r} ${r} 0 0 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
}
const ARCS = [arc(ANKLE.x, ANKLE.y, 165, -28, 2), arc(282, 196, 34, -100, -30)]
</script>

<template>
  <g class="joints" :class="{ 'is-active': active }">
    <defs>
      <marker
        :id="`${uid}-arrow`"
        viewBox="0 0 10 10"
        refX="5"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M1 1L9 5L1 9" fill="none" stroke="var(--color-cyan)" stroke-width="1.6" />
      </marker>
      <linearGradient :id="`${uid}-fade`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0" />
        <stop offset="0.35" stop-color="#fff" stop-opacity="1" />
      </linearGradient>
      <mask :id="`${uid}-mask`" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="240">
        <rect width="360" height="240" :fill="`url(#${uid}-fade)`" />
      </mask>
    </defs>

    <!-- Referencias: eje de la pierna y suelo -->
    <path d="M100 0V211" class="jd-guide" />
    <path d="M20 211H352" class="jd-ground" />

    <!-- Silueta fantasma: arco de movilidad del tobillo -->
    <g class="jd-ghost" :style="{ transformOrigin: `${ANKLE.x}px ${ANKLE.y}px` }">
      <path :d="FOOT_ONLY" />
    </g>

    <g :mask="`url(#${uid}-mask)`">
      <path :d="LEG_FOOT" class="jd-body" />
    </g>

    <path
      v-for="(d, i) in ARCS"
      :key="i"
      :d="d"
      pathLength="1"
      class="jd-arc"
      :marker-start="`url(#${uid}-arrow)`"
      :marker-end="`url(#${uid}-arrow)`"
    />

    <g v-for="(j, i) in JOINTS" :key="i" class="jd-joint">
      <circle :cx="j.x" :cy="j.y" r="9" class="jd-joint-halo" />
      <circle :cx="j.x" :cy="j.y" r="3.6" class="jd-joint-dot" />
    </g>
  </g>
</template>

<style scoped>
.joints path {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.jd-guide {
  stroke: var(--color-border-strong);
  stroke-opacity: 0.45;
  stroke-width: 1;
  stroke-dasharray: 3 6;
}
.jd-ground {
  stroke: var(--color-border);
  stroke-width: 1.2;
}
.joints .jd-body {
  fill: var(--color-light-blue);
  stroke: var(--color-primary);
  stroke-width: 1.8;
}
.joints .jd-ghost path {
  fill: var(--color-ice-blue);
  fill-opacity: 0.35;
  stroke: var(--color-cyan);
  stroke-opacity: 0.6;
  stroke-width: 1.2;
  stroke-dasharray: 4 5;
}
.joints .jd-arc {
  stroke: var(--color-cyan);
  stroke-width: 1.8;
  stroke-dasharray: 1 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1) 200ms;
}
.is-active .jd-arc {
  stroke-dashoffset: 0;
}
.jd-joint-halo {
  fill: var(--color-cyan);
  fill-opacity: 0.18;
}
.jd-joint-dot {
  fill: var(--color-white);
  stroke: var(--color-primary);
  stroke-width: 1.8;
}

@media (prefers-reduced-motion: no-preference) {
  .is-active .jd-ghost {
    animation: jd-swing 3.6s cubic-bezier(0.65, 0, 0.35, 1) infinite alternate;
  }
}
@media (prefers-reduced-motion: reduce) {
  .joints .jd-arc {
    transition: none;
  }
  .jd-ghost {
    transform: rotate(-9deg);
  }
}

@keyframes jd-swing {
  from {
    transform: rotate(-10deg);
  }
  to {
    transform: rotate(8deg);
  }
}
</style>
