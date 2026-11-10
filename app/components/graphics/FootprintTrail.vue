<script setup lang="ts">
/**
 * Rastro de huellas alternas (spec 01 §7, spec 03 §5). Las huellas siguen una curva (bezier cuadrática) y
 * aparecen en secuencia (stagger 120 ms) al entrar en viewport. Decorativo (aria-hidden).
 * - `vertical`: trayectoria hacia abajo (móvil).
 * - Reduced motion o sin JS: huellas visibles y estáticas.
 */
import { FOOT_H, FOOT_W } from '~/utils/pressure'

type Point = readonly [number, number]

const props = withDefaults(
  defineProps<{
    steps?: number
    /** Lienzo del SVG (unidades de usuario). */
    width?: number
    height?: number
    /** Curva: inicio, control y final. */
    from?: Point
    control?: Point
    to?: Point
    /** Escala de cada huella. */
    scale?: number
    /** Separación lateral entre pie izquierdo y derecho. */
    stride?: number
  }>(),
  {
    steps: 7,
    width: 600,
    height: 260,
    from: () => [30, 230] as const,
    control: () => [260, 250] as const,
    to: () => [570, 50] as const,
    scale: 0.16,
    stride: 12,
  },
)

const prints = computed(() => {
  const [x0, y0] = props.from
  const [x1, y1] = props.control
  const [x2, y2] = props.to
  return Array.from({ length: props.steps }, (_, i) => {
    const t = props.steps === 1 ? 1 : i / (props.steps - 1)
    const mt = 1 - t
    const x = mt * mt * x0 + 2 * mt * t * x1 + t * t * x2
    const y = mt * mt * y0 + 2 * mt * t * y1 + t * t * y2
    const dx = 2 * mt * (x1 - x0) + 2 * t * (x2 - x1)
    const dy = 2 * mt * (y1 - y0) + 2 * t * (y2 - y1)
    const len = Math.hypot(dx, dy) || 1
    const side = i % 2 === 0 ? 'left' : 'right'
    const offset = (side === 'left' ? -1 : 1) * props.stride
    // La huella "mira" hacia arriba en sus coordenadas: se gira para seguir la tangente
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90
    const px = x + (-dy / len) * offset
    const py = y + (dx / len) * offset
    return {
      side,
      transform: `translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${props.scale}) translate(${-FOOT_W / 2} ${-FOOT_H / 2})`,
      opacity: 0.3 + (0.7 * (i + 1)) / props.steps,
    } as const
  })
})

const root = ref<SVGSVGElement | null>(null)
const state = ref<'idle' | 'armed' | 'walking'>('idle')
let observer: IntersectionObserver | undefined

onMounted(() => {
  if (!root.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  state.value = 'armed'
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      state.value = 'walking'
      observer?.disconnect()
    },
    { threshold: 0.3 },
  )
  observer.observe(root.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <svg
    ref="root"
    :viewBox="`0 0 ${width} ${height}`"
    class="footprint-trail overflow-visible"
    :class="`is-${state}`"
    aria-hidden="true"
    focusable="false"
  >
    <g
      v-for="(p, i) in prints"
      :key="i"
      class="print"
      :style="{ '--i': i, '--o': p.opacity }"
      :transform="p.transform"
    >
      <Footprint :side="p.side" variant="fill" />
    </g>
  </svg>
</template>

<style scoped>
.print {
  opacity: var(--o);
}
.is-armed .print {
  opacity: 0;
}
.is-walking .print {
  animation: print-in 520ms var(--ease-out-soft) both;
  animation-delay: calc(var(--i) * 120ms);
}
@keyframes print-in {
  from {
    opacity: 0;
  }
  to {
    opacity: var(--o);
  }
}
</style>
