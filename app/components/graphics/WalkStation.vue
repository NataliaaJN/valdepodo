<script setup lang="ts">
/**
 * Una estación de «El paseo»: las huellas de una fase con su mapa de presión. `<g>` para componerlo dentro del
 * lienzo del recorrido (o de una miniatura en la versión estática). El brillo y la escala de la estación los
 * mueve GSAP desde fuera; aquí solo se decide qué estado de mapa y qué marcas lleva cada fase.
 *  - `active`: el mapa se enciende (y en marcha/carrera recorre contacto → apoyo medio → despegue).
 *  - `past`: la huella queda marcada, con la carga de reposo.
 *  - `future`: solo el contorno, apagada.
 */
import { jointPoints, walkFeet, walkHeat, WALK_SCALE } from '~/data/biomech-walk'
import { pressureStates } from '~/data/biomech'
import { FOOT_H, FOOT_W, INSOLE_PATH, type MapTransition } from '~/utils/pressure'

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
const feet = computed(() => walkFeet[props.phase]!)
const lit = computed(() => props.role !== 'future')
const active = computed(() => props.role === 'active')

const footTransform = (f: { dx: number; rot: number }) =>
  `translate(${AXIS + f.dx} ${props.cy}) rotate(${f.rot}) scale(${WALK_SCALE}) translate(${-FOOT_W / 2} ${-FOOT_H / 2})`

const stateFor = (i: number) => (active.value ? walkHeat(props.phase, props.sub, i) : pressureStates.standing)
const labelY = computed(() => props.cy + (FOOT_H * WALK_SCALE) / 2 + 26)
</script>

<template>
  <g class="ws" :class="`ws--${role}`">
    <g v-for="(f, i) in feet" :key="f.side" :transform="footTransform(f)">
      <path
        v-if="phase === 5"
        :d="INSOLE_PATH"
        pathLength="1"
        class="ws-insole"
        :class="{ 'is-on': active }"
        :transform="f.side === 'left' ? `translate(${FOOT_W} 0) scale(-1 1)` : undefined"
      />
      <PressureMap
        :state="stateFor(i)"
        :side="f.side"
        :lit="lit"
        :transition="mode"
        :duration="0.5"
        :blur="3.5"
      />
      <SupportPoints v-if="phase === 0" :side="f.side" :points="jointPoints" :active="active" />
      <SupportPoints v-else-if="phase === 1" :side="f.side" :active="active" />
    </g>

    <g v-if="phase === 4" class="ws-labels" :class="{ 'is-on': active }">
      <text :x="AXIS - 66" :y="labelY" text-anchor="middle">Izq.</text>
      <text :x="AXIS + 66" :y="labelY" text-anchor="middle">Dcha.</text>
    </g>
  </g>
</template>

<style scoped>
.ws {
  --fp-fill: rgb(241 239 233 / 0.06);
  --fp-stroke: rgb(241 239 233 / 0.32);
}
.ws--active {
  --fp-stroke: var(--color-cyan);
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
.ws-insole.is-on {
  stroke-dashoffset: 0;
  fill: rgb(200 241 250 / 0.1);
}

.ws-labels text {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  fill: var(--color-ice-blue);
  opacity: 0;
  transition: opacity var(--dur-fast) ease;
}
.ws-labels.is-on text {
  opacity: 0.85;
}

@media (prefers-reduced-motion: reduce) {
  .ws-insole,
  .ws-labels text {
    transition: none;
  }
}
</style>
