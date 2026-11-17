<script setup lang="ts">
/**
 * Secuencia de marcha (spec 08 §3): huellas alternas izquierda/derecha sobre una trayectoria. Con `playing`,
 * cada huella recorre contacto de talón → apoyo medio → despegue y la siguiente aparece; la activa en
 * primary/cian y las anteriores en ice-blue. Sin `playing` (o con reduced motion) es una composición estática.
 *
 * `stride` cambia entre marcha y carrera: la disposición se interpola (morph) con un único valor `mix`
 * animado por GSAP, del que derivan posiciones, giros y las líneas de velocidad.
 */
import { gsap } from 'gsap'
import { gaitCycle, pressureStates, runCycle } from '~/data/biomech'
import { FOOT_H, FOOT_W, type FootSide, type MapTransition } from '~/utils/pressure'

const props = withDefaults(
  defineProps<{
    stride?: 'walk' | 'run'
    playing?: boolean
    transition?: MapTransition
    /** `false` muestra las huellas apagadas (antes de entrar en viewport). */
    lit?: boolean
    /** Dibuja el centro de presiones en la huella activa. */
    pressureCenter?: boolean
  }>(),
  { stride: 'walk', playing: true, transition: 'morph', lit: true, pressureCenter: true },
)

const VIEW_W = 300
const VIEW_H = 520
const STEPS = 4
const SCALE = 0.6

const reducedMotion = useReducedMotion()
const uid = useId()

/* ----- Disposición: marcha (mix 0) ↔ carrera (mix 1) ----- */
const mix = reactive({ v: props.stride === 'run' ? 1 : 0 })
const lerp = (a: number, b: number) => a + (b - a) * mix.v

const steps = computed(() =>
  Array.from({ length: STEPS }, (_, i) => {
    const side: FootSide = i % 2 === 0 ? 'left' : 'right'
    const sign = side === 'left' ? -1 : 1
    return {
      side,
      x: VIEW_W / 2 + sign * lerp(34, 15),
      y: lerp(440 - i * 118, 452 - i * 162),
      rot: sign * lerp(6, 3),
    }
  }),
)
const linePoints = computed(() => [
  { x: VIEW_W / 2, y: VIEW_H - 8 },
  ...steps.value.map((s) => ({ x: VIEW_W / 2 + (s.x - VIEW_W / 2) * 0.12, y: s.y })),
  { x: VIEW_W / 2, y: steps.value[STEPS - 1]!.y - 70 },
])

watch(
  () => props.stride,
  (stride) => {
    const v = stride === 'run' ? 1 : 0
    if (props.transition !== 'morph' || reducedMotion.value) {
      gsap.killTweensOf(mix)
      mix.v = v
    } else {
      gsap.to(mix, { v, duration: 0.9, ease: 'power2.inOut', overwrite: true })
    }
  },
)

/* ----- Ciclo de apoyo ----- */
const active = ref(0) // índice de la huella activa (STEPS = todas completadas)
const sub = ref(0) // 0 contacto · 1 apoyo medio · 2 despegue
const animated = computed(() => props.playing && !reducedMotion.value)

function stateFor(i: number) {
  const cycle = props.stride === 'run' ? runCycle : gaitCycle
  if (!animated.value) return pressureStates[props.stride === 'run' ? 'runForefoot' : 'midstance']
  if (i === active.value) return pressureStates[cycle[sub.value]!]
  return pressureStates.idle
}
function roleFor(i: number): 'active' | 'past' | 'future' {
  if (!animated.value) return 'active'
  if (i === active.value) return 'active'
  return i < active.value ? 'past' : 'future'
}

let tl: gsap.core.Timeline | undefined

function build() {
  tl?.kill()
  tl = undefined
  active.value = 0
  sub.value = 0
  if (!animated.value) return
  const subDur = props.stride === 'run' ? 0.26 : 0.36
  tl = gsap.timeline({ repeat: -1 })
  for (let i = 0; i < STEPS; i++) {
    for (let s = 0; s < 3; s++) {
      tl.call(() => {
        active.value = i
        sub.value = s
      })
      tl.to({}, { duration: subDur })
    }
  }
  tl.call(() => {
    active.value = STEPS
  })
  tl.to({}, { duration: 1.1 })
}

watch(() => [animated.value, props.stride], build)
onMounted(build)
onBeforeUnmount(() => {
  tl?.kill()
  gsap.killTweensOf(mix)
})
</script>

<template>
  <svg :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`" aria-hidden="true" focusable="false" class="gait">
    <defs>
      <linearGradient :id="`${uid}-fade`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0" />
        <stop offset="0.14" stop-color="#fff" stop-opacity="1" />
        <stop offset="0.9" stop-color="#fff" stop-opacity="1" />
        <stop offset="1" stop-color="#fff" stop-opacity="0" />
      </linearGradient>
      <mask :id="`${uid}-mask`" maskUnits="userSpaceOnUse" x="0" y="0" :width="VIEW_W" :height="VIEW_H">
        <rect :width="VIEW_W" :height="VIEW_H" :fill="`url(#${uid}-fade)`" />
      </mask>
    </defs>

    <g :mask="`url(#${uid}-mask)`">
      <!-- Líneas de velocidad (solo carrera) -->
      <g class="gait-speed" :style="{ opacity: mix.v }">
        <path
          v-for="n in 5"
          :key="n"
          :d="`M${40 + n * 12} ${120 + n * 62}v${70 + (n % 2) * 40}`"
          :style="{ '--gs-delay': `${n * 0.17}s` }"
        />
        <path
          v-for="n in 5"
          :key="`r${n}`"
          :d="`M${VIEW_W - 40 - n * 12} ${90 + n * 66}v${60 + (n % 3) * 30}`"
          :style="{ '--gs-delay': `${n * 0.21}s` }"
        />
      </g>

      <ProgressionLine :points="linePoints" />

      <g
        v-for="(step, i) in steps"
        :key="i"
        class="gait-step"
        :class="`is-${roleFor(i)}`"
        :transform="`translate(${step.x} ${step.y}) rotate(${step.rot}) scale(${SCALE}) translate(${-FOOT_W / 2} ${-FOOT_H / 2})`"
      >
        <PressureMap
          :state="stateFor(i)"
          :side="step.side"
          :lit="lit"
          :transition="transition"
          :duration="0.3"
        />
        <PressureCenterPath
          v-if="pressureCenter && roleFor(i) === 'active' && (animated || i === STEPS - 1)"
          :side="step.side"
          :progress="animated ? (sub + 1) / 3 : 1"
          :duration="props.stride === 'run' ? 0.26 : 0.36"
        />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.gait-step {
  transition: opacity 360ms cubic-bezier(0.22, 1, 0.36, 1);
}
.gait-step.is-future {
  opacity: 0;
}
.gait-step.is-past {
  opacity: 0.85;
  --fp-stroke: var(--color-ice-blue);
  --fp-fill: var(--color-light-blue);
}
.gait-speed path {
  fill: none;
  stroke: var(--color-ice-blue);
  stroke-width: 2;
  stroke-linecap: round;
}

@media (prefers-reduced-motion: no-preference) {
  .gait-speed path {
    animation: gs-run 1.1s linear var(--gs-delay) infinite;
  }
}

@keyframes gs-run {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  40% {
    opacity: 1;
  }
  to {
    transform: translateY(40px);
    opacity: 0;
  }
}
</style>
