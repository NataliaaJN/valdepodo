<script setup lang="ts">
/**
 * Una estación de «El paseo»: las huellas de una fase con su mapa de presión (rampa clínica: azul → rojo). `<g>`
 * para componerlo dentro del lienzo del recorrido (o de una miniatura en la versión estática). El brillo y la
 * escala de la estación los mueve GSAP desde fuera; aquí solo se decide qué estado de mapa y qué marcas lleva
 * cada fase.
 *  - `active`: el mapa se enciende (y en marcha/carrera recorre contacto → apoyo medio → despegue).
 *  - `past`: la huella queda marcada, con la carga de reposo.
 *  - `future`: solo el contorno, apagada.
 * Fase 05: comparativa izquierda/derecha con barras de reparto por zona. Fase 06: sin plantilla / con plantilla.
 */
import { jointPoints, walkFeet, walkHeat, WALK_SCALE } from '~/data/biomech-walk'
import { pressureStates } from '~/data/biomech'
import {
  FOOT_H,
  FOOT_W,
  INSOLE_PATH,
  focusList,
  type MapTransition,
  type PressureState,
} from '~/utils/pressure'

const props = defineProps<{
  phase: number
  /** Ordenada del centro de la estación en el lienzo. */
  cy: number
  role: 'active' | 'past' | 'future'
  /** 0 contacto · 1 apoyo medio · 2 despegue. */
  sub: number
  mode: MapTransition
}>()

const AXIS = 200
const COMPARE = 4
const feet = computed(() => walkFeet[props.phase]!)
const lit = computed(() => props.role !== 'future')
const active = computed(() => props.role === 'active')

/** En la comparativa las huellas son más pequeñas y suben para dejar sitio a las barras. */
const scale = computed(() => (props.phase === COMPARE ? 0.62 : WALK_SCALE))
const footY = computed(() => props.cy + (props.phase === COMPARE ? -63 : 0))
const footTransform = (f: { dx: number; rot: number }) =>
  `translate(${AXIS + f.dx} ${footY.value}) rotate(${f.rot}) scale(${scale.value}) translate(${-FOOT_W / 2} ${-FOOT_H / 2})`

const stateFor = (i: number) => (active.value ? walkHeat(props.phase, props.sub, i) : pressureStates.standing)

/** Zona de apoyo del arco interno de la plantilla (huella derecha). */
const ARCH_PATH = 'M40 132C52 126 70 140 72 162C73 178 66 192 56 194C46 182 40 152 40 132Z'
const insoleOn = computed(() => active.value && props.sub >= 1)
const labelY = computed(() => props.cy + (FOOT_H * WALK_SCALE) / 2 + 26)

/** Reparto relativo izquierda/derecha por zona (sin cifras), derivado de los mapas de la fase 05. */
const bars = computed(() => {
  const zone = (s: PressureState) => {
    const f = focusList(s)
    const sum = (keys: number[]) => keys.reduce((acc, k) => acc + f[k]!.intensity, 0)
    return { rear: sum([0]), mid: sum([1]), fore: sum([2, 3, 4, 5, 6]) / 3 }
  }
  const l = zone(walkHeat(COMPARE, 1, 0))
  const r = zone(walkHeat(COMPARE, 1, 1))
  return (
    [
      ['Antepié', l.fore, r.fore],
      ['Mediopié', l.mid, r.mid],
      ['Retropié', l.rear, r.rear],
    ] as const
  ).map(([label, a, b]) => {
    const max = Math.max(a, b, 0.001)
    return { label, left: a / max, right: b / max }
  })
})
</script>

<template>
  <g class="ws" :class="`ws--${role}`">
    <g v-for="(f, i) in feet" :key="f.side" :transform="footTransform(f)">
      <!-- Propuesta de tratamiento: el pie derecho se apoya en una plantilla (arco y apoyo metatarsal) -->
      <g v-if="phase === 5 && i === 1" class="ws-insole-set" :class="{ 'is-on': insoleOn }">
        <path :d="INSOLE_PATH" pathLength="1" class="ws-insole" />
        <path :d="ARCH_PATH" class="ws-support" />
        <ellipse cx="57" cy="106" rx="15" ry="6" class="ws-support" />
      </g>
      <PressureMap
        :state="stateFor(i)"
        :side="f.side"
        :lit="lit"
        :transition="mode"
        :duration="0.5"
        :blur="3.5"
        ramp="clinical"
      />
      <SupportPoints v-if="phase === 0" :side="f.side" :points="jointPoints" :active="active" />
      <SupportPoints v-else-if="phase === 1" :side="f.side" :active="active" />
    </g>

    <!-- Fase 05: reparto del peso entre los dos pies, por zonas -->
    <g v-if="phase === COMPARE" class="ws-compare" :class="{ 'is-on': active }">
      <text :x="AXIS - 12" :y="cy + 34" text-anchor="end" class="ws-head">Izq.</text>
      <text :x="AXIS + 12" :y="cy + 34" class="ws-head">Dcha.</text>
      <g v-for="(row, i) in bars" :key="row.label">
        <text :x="AXIS" :y="cy + 62 + i * 36" text-anchor="middle" class="ws-row">{{ row.label }}</text>
        <rect :x="AXIS - 132" :y="cy + 68 + i * 36" width="126" height="10" rx="5" class="ws-track" />
        <rect :x="AXIS + 6" :y="cy + 68 + i * 36" width="126" height="10" rx="5" class="ws-track" />
        <rect
          :x="AXIS - 132"
          :y="cy + 68 + i * 36"
          width="126"
          height="10"
          rx="5"
          class="ws-bar ws-bar-l"
          :style="{ transform: `scaleX(${row.left})` }"
        />
        <rect
          :x="AXIS + 6"
          :y="cy + 68 + i * 36"
          width="126"
          height="10"
          rx="5"
          class="ws-bar ws-bar-r"
          :style="{ transform: `scaleX(${row.right})` }"
        />
      </g>
    </g>

    <g v-if="phase === 5" class="ws-labels" :class="{ 'is-on': active }">
      <text :x="AXIS - 66" :y="labelY" text-anchor="middle">Sin plantilla</text>
      <text :x="AXIS + 66" :y="labelY" text-anchor="middle">Con plantilla</text>
    </g>
  </g>
</template>

<style scoped>
.ws {
  --fp-fill: rgb(241 239 233 / 0.06);
  --fp-stroke: rgb(241 239 233 / 0.32);
}
.ws--active {
  --fp-stroke: rgb(241 239 233 / 0.6);
}
.ws--future {
  --fp-fill: rgb(241 239 233 / 0.03);
  --fp-stroke: rgb(241 239 233 / 0.24);
}

.ws-insole {
  fill: rgb(200 241 250 / 0);
  stroke: var(--color-cyan);
  stroke-width: 1.6;
  stroke-dasharray: 1 1;
  stroke-dashoffset: 1;
  transition:
    stroke-dashoffset 1100ms var(--ease-out-soft),
    fill 700ms ease 400ms;
}
.ws-insole-set.is-on .ws-insole {
  stroke-dashoffset: 0;
  fill: rgb(200 241 250 / 0.1);
}
.ws-support {
  fill: rgb(241 239 233 / 0.22);
  stroke: var(--color-bone);
  stroke-width: 1.2;
  stroke-dasharray: 3 3;
  opacity: 0;
  transition: opacity 600ms ease 500ms;
}
.ws-insole-set.is-on .ws-support {
  opacity: 1;
}

.ws-labels text,
.ws-compare text {
  font-family: var(--font-sans);
  fill: var(--color-ice-blue);
}
.ws-labels text,
.ws-head {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.ws-row {
  font-size: 13px;
}
.ws-labels text,
.ws-compare {
  opacity: 0;
  transition: opacity var(--dur-fast) ease;
}
.ws-labels.is-on text {
  opacity: 0.85;
}
.ws-compare.is-on {
  opacity: 1;
}
.ws-track {
  fill: rgb(241 239 233 / 0.12);
}
.ws-bar {
  transform-box: fill-box;
  transition: transform 900ms var(--ease-out-soft) 150ms;
}
.ws-compare:not(.is-on) .ws-bar {
  transform: scaleX(0) !important;
}
.ws-bar-l {
  fill: var(--color-cyan);
  transform-origin: right center;
}
.ws-bar-r {
  fill: var(--color-bone);
  transform-origin: left center;
}

@media (prefers-reduced-motion: reduce) {
  .ws-insole,
  .ws-support,
  .ws-bar,
  .ws-compare,
  .ws-labels text {
    transition: none;
  }
}
</style>
