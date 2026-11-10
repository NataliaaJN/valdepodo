<script setup lang="ts">
/**
 * Trayectoria del centro de presiones (spec 08 §3): trazo que se dibuja con `stroke-dashoffset` y un punto
 * que la recorre. `<g>` en coordenadas de huella. `progress` (0..1) es el estado declarativo; con `autoplay`
 * recorre la trayectoria en bucle. Con reduced motion se muestra completa y sin punto móvil.
 */
import { gsap } from 'gsap'
import { FOOT_W, PRESSURE_CENTER_PATH, type FootSide } from '~/utils/pressure'

const props = withDefaults(
  defineProps<{
    side?: FootSide
    d?: string
    progress?: number
    autoplay?: boolean
    /** Segundos de un recorrido completo (autoplay) o de cada cambio de `progress`. */
    duration?: number
  }>(),
  { side: 'right', d: PRESSURE_CENTER_PATH, progress: 1, autoplay: false, duration: 0.45 },
)

const reducedMotion = useReducedMotion()
const path = ref<SVGPathElement | null>(null)
const state = reactive({ p: props.autoplay ? 0 : props.progress })
const dot = reactive({ x: 0, y: 0, visible: false })

const mirror = computed(() => (props.side === 'left' ? `translate(${FOOT_W} 0) scale(-1 1)` : undefined))
const shown = computed(() => (reducedMotion.value ? 1 : state.p))

function placeDot() {
  const el = path.value
  if (!el) return
  const pt = el.getPointAtLength(el.getTotalLength() * shown.value)
  dot.x = pt.x
  dot.y = pt.y
  dot.visible = !reducedMotion.value && shown.value > 0.001
}

let tween: gsap.core.Tween | undefined

function start() {
  tween?.kill()
  if (reducedMotion.value) return placeDot()
  if (props.autoplay) {
    state.p = 0
    tween = gsap.to(state, {
      p: 1,
      duration: props.duration,
      ease: 'power1.inOut',
      repeat: -1,
      repeatDelay: 0.7,
      onUpdate: placeDot,
    })
  } else {
    tween = gsap.to(state, {
      p: props.progress,
      duration: props.duration,
      ease: 'power2.out',
      onUpdate: placeDot,
    })
  }
}

watch(() => [props.progress, props.autoplay, reducedMotion.value], start)
onMounted(() => {
  placeDot()
  start()
})
onBeforeUnmount(() => tween?.kill())
</script>

<template>
  <g :transform="mirror" class="cop">
    <path :d="d" class="cop-track" />
    <path ref="path" :d="d" pathLength="1" class="cop-line" :stroke-dashoffset="1 - shown" />
    <circle v-show="dot.visible" class="cop-dot" :cx="dot.x" :cy="dot.y" r="4.2" />
  </g>
</template>

<style scoped>
.cop path {
  fill: none;
  stroke-linecap: round;
}
.cop-track {
  stroke: var(--color-white);
  stroke-opacity: 0.35;
  stroke-width: 2;
  stroke-dasharray: 2 5;
}
.cop-line {
  stroke: var(--color-deep-blue);
  stroke-width: 2.4;
  stroke-dasharray: 1 1;
}
.cop-dot {
  fill: var(--color-white);
  stroke: var(--color-deep-blue);
  stroke-width: 2;
}
</style>
