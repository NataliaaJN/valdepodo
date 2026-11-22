<script setup lang="ts">
/**
 * Visual de una fase del Estudio biomecánico (spec 04 §1.3). Tres capas que se funden entre sí (400 ms):
 * - `joints`  → fase 01 (contorno lateral, ejes y arcos de movilidad);
 * - `pair`    → fases 02, 05 y 06 (las dos huellas: estático, comparativa y plantilla), con morph de focos
 *               y de posición entre ellas;
 * - `gait`    → fases 03 y 04 (secuencia de marcha que se transforma en carrera).
 * Decorativo (`aria-hidden`): el texto equivalente está en la lista de fases.
 */
import { pressureStates } from '~/features/services/data/biomech'
import type { BiomechScene } from '~/features/services/data/biomech'
import {
  FOOT_H,
  FOOT_W,
  INSOLE_PATH,
  focusList,
  type MapTransition,
  type PressureState,
} from '~/utils/pressure'

const props = withDefaults(
  defineProps<{
    scene: BiomechScene
    transition?: MapTransition
    /** Animaciones en bucle (marcha, pulsos). Se pausa fuera de viewport. */
    playing?: boolean
    /** `false` = mapas apagados (se "encienden" al entrar en viewport en móvil). */
    lit?: boolean
  }>(),
  { transition: 'morph', playing: true, lit: true },
)

const VIEW_W = 400
const VIEW_H = 520

type PairScene = 'static' | 'compare' | 'insole'
type GaitScene = 'gait' | 'run'
const isPair = (s: BiomechScene): s is PairScene => s === 'static' || s === 'compare' || s === 'insole'
const isGait = (s: BiomechScene): s is GaitScene => s === 'gait' || s === 'run'

// Cada capa conserva su último estado mientras está oculta: así, al volver, transforma desde donde estaba.
const pairScene = ref<PairScene>(isPair(props.scene) ? props.scene : 'static')
const gaitScene = ref<GaitScene>(isGait(props.scene) ? props.scene : 'gait')
watch(
  () => props.scene,
  (s) => {
    if (isPair(s)) pairScene.value = s
    if (isGait(s)) gaitScene.value = s
  },
)
const layer = computed(() => (isPair(props.scene) ? 'pair' : isGait(props.scene) ? 'gait' : 'joints'))

/* ----- Capa "pair" ----- */
const PAIR_LAYOUT: Record<PairScene, { y: number; scale: number; gap: number }> = {
  static: { y: 262, scale: 1.18, gap: 80 },
  compare: { y: 168, scale: 0.8, gap: 62 },
  insole: { y: 262, scale: 1.1, gap: 80 },
}
function footTransform(side: 'left' | 'right') {
  const { y, scale, gap } = PAIR_LAYOUT[pairScene.value]
  const x = VIEW_W / 2 + (side === 'left' ? -1 : 1) * gap
  return `translate(${x}px, ${y}px) scale(${scale}) translate(${-FOOT_W / 2}px, ${-FOOT_H / 2}px)`
}
const pairStates = computed<Record<'left' | 'right', PressureState>>(() =>
  pairScene.value === 'compare'
    ? { left: pressureStates.standing, right: pressureStates.standingAlt }
    : { left: pressureStates.standing, right: pressureStates.standing },
)

/** Barras de la comparativa: reparto relativo izquierda/derecha por zona, derivado de los estados ilustrativos. */
const bars = computed(() => {
  const zone = (s: PressureState) => {
    const f = focusList(s)
    const sum = (keys: number[]) => keys.reduce((acc, k) => acc + f[k]!.intensity, 0)
    return { rear: sum([0]), mid: sum([1]), fore: sum([2, 3, 4, 5, 6]) / 3 }
  }
  const l = zone(pairStates.value.left)
  const r = zone(pairStates.value.right)
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

/* ----- Capa "gait" ----- */
const gaitPlaying = computed(() => props.playing && layer.value === 'gait')
</script>

<template>
  <svg
    :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`"
    aria-hidden="true"
    focusable="false"
    class="stage"
    :class="[`mode-${transition}`, `scene-${scene}`]"
  >
    <!-- 01 · Articular -->
    <g class="stage-layer" :class="{ 'is-on': layer === 'joints' }" transform="translate(22 150)">
      <FootJointsDiagram :active="layer === 'joints' && playing" />
    </g>

    <!-- 02 · 05 · 06 · Huellas -->
    <g class="stage-layer" :class="{ 'is-on': layer === 'pair' }">
      <g
        v-for="side in ['left', 'right'] as const"
        :key="side"
        class="pair-foot"
        :style="{ transform: footTransform(side) }"
      >
        <path
          :d="INSOLE_PATH"
          pathLength="1"
          class="insole"
          :class="{ 'is-on': pairScene === 'insole' }"
          :transform="side === 'left' ? `translate(${FOOT_W} 0) scale(-1 1)` : undefined"
        />
        <PressureMap :state="pairStates[side]" :side="side" :lit="lit" :transition="transition" />
        <SupportPoints
          :side="side"
          class="pair-points"
          :class="{ 'is-on': pairScene === 'static' }"
          :active="playing && layer === 'pair' && pairScene === 'static'"
        />
      </g>

      <!-- Comparativa: reparto relativo sin unidades ni cifras -->
      <g class="compare" :class="{ 'is-on': pairScene === 'compare' }" transform="translate(0 318)">
        <text :x="VIEW_W / 2 - 12" y="0" text-anchor="end" class="cmp-head">Izq.</text>
        <text :x="VIEW_W / 2 + 12" y="0" class="cmp-head">Dcha.</text>
        <g v-for="(row, i) in bars" :key="row.label" :transform="`translate(0 ${26 + i * 44})`">
          <text :x="VIEW_W / 2" y="0" text-anchor="middle" class="cmp-label">{{ row.label }}</text>
          <rect :x="VIEW_W / 2 - 132" y="8" width="126" height="12" rx="6" class="cmp-track" />
          <rect :x="VIEW_W / 2 + 6" y="8" width="126" height="12" rx="6" class="cmp-track" />
          <rect
            :x="VIEW_W / 2 - 132"
            y="8"
            width="126"
            height="12"
            rx="6"
            class="cmp-bar cmp-bar-l"
            :style="{ transform: `scaleX(${row.left})` }"
          />
          <rect
            :x="VIEW_W / 2 + 6"
            y="8"
            width="126"
            height="12"
            rx="6"
            class="cmp-bar cmp-bar-r"
            :style="{ transform: `scaleX(${row.right})` }"
          />
        </g>
        <text :x="VIEW_W / 2" y="172" text-anchor="middle" class="cmp-note">
          Ejemplo ilustrativo · sin valores reales
        </text>
      </g>
    </g>

    <!-- 03 · 04 · Marcha y carrera -->
    <g class="stage-layer" :class="{ 'is-on': layer === 'gait' }">
      <svg x="50" y="0" width="300" height="520" viewBox="0 0 300 520" overflow="visible">
        <GaitSequence
          :stride="gaitScene === 'run' ? 'run' : 'walk'"
          :playing="gaitPlaying"
          :transition="transition"
          :lit="lit"
        />
      </svg>
    </g>
  </svg>
</template>

<style scoped>
.stage {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.stage-layer {
  opacity: 0;
  transition: opacity 400ms cubic-bezier(0.65, 0, 0.35, 1);
}
.stage-layer.is-on {
  opacity: 1;
}

.pair-foot {
  transition: transform 800ms cubic-bezier(0.65, 0, 0.35, 1);
}
.pair-points {
  opacity: 0;
  transition: opacity 400ms ease;
}
.pair-points.is-on {
  opacity: 1;
}

.insole {
  fill: var(--color-ice-blue);
  fill-opacity: 0;
  stroke: var(--color-primary);
  stroke-width: 1.6;
  stroke-dasharray: 1 1;
  stroke-dashoffset: 1;
  transition:
    stroke-dashoffset 1100ms cubic-bezier(0.22, 1, 0.36, 1),
    fill-opacity 700ms ease 500ms;
}
.insole.is-on {
  stroke-dashoffset: 0;
  fill-opacity: 0.55;
}

.compare {
  opacity: 0;
  transition: opacity 400ms ease;
}
.compare.is-on {
  opacity: 1;
}
.compare text {
  font-family: var(--font-sans);
  fill: var(--color-text-secondary);
}
.cmp-head {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.cmp-label {
  font-size: 15px;
}
.cmp-note {
  font-size: 13px;
}
.cmp-track {
  fill: var(--color-light-blue);
}
.cmp-bar {
  transform-box: fill-box;
  transition: transform 900ms cubic-bezier(0.22, 1, 0.36, 1) 150ms;
}
.compare:not(.is-on) .cmp-bar {
  transform: scaleX(0) !important;
}
.cmp-bar-l {
  fill: var(--color-primary);
  transform-origin: right center;
}
.cmp-bar-r {
  fill: var(--color-cyan);
  transform-origin: left center;
}

/* Tablet: fundidos, sin desplazamientos. Reduced motion / estático: cambio inmediato. */
.mode-fade .pair-foot,
.mode-fade .cmp-bar {
  transition: none;
}
.mode-instant .stage-layer,
.mode-instant .pair-foot,
.mode-instant .pair-points,
.mode-instant .insole,
.mode-instant .compare,
.mode-instant .cmp-bar {
  transition: none;
}
</style>
