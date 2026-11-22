<script setup lang="ts">
/** Puntos de apoyo con pulso CSS (spec 08 §3). `<g>` en coordenadas de huella. */
import { FOOT_W, SUPPORT_POINTS, type FootSide } from '~/utils/pressure'

const props = withDefaults(
  defineProps<{
    side?: FootSide
    points?: readonly { id: string; x: number; y: number }[]
    /** Con `false` los puntos quedan quietos y atenuados. */
    active?: boolean
  }>(),
  { side: 'right', points: () => SUPPORT_POINTS, active: true },
)

const mirror = computed(() => (props.side === 'left' ? `translate(${FOOT_W} 0) scale(-1 1)` : undefined))
</script>

<template>
  <g :transform="mirror" class="support-points" :class="{ 'is-active': active }">
    <g v-for="(p, i) in points" :key="p.id" :style="{ '--sp-delay': `${i * 0.45}s` }">
      <circle class="sp-ring" :cx="p.x" :cy="p.y" r="7" />
      <circle class="sp-dot" :cx="p.x" :cy="p.y" r="3.6" />
    </g>
  </g>
</template>

<style scoped>
.sp-dot {
  fill: var(--color-white);
  stroke: var(--color-primary);
  stroke-width: 1.6;
  transition: opacity var(--dur-base) ease;
}
.sp-ring {
  fill: none;
  stroke: var(--color-white);
  stroke-width: 1.4;
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
}
.support-points:not(.is-active) .sp-dot {
  opacity: 0.55;
}

@media (prefers-reduced-motion: no-preference) {
  .is-active .sp-ring {
    animation: sp-pulse 2.4s cubic-bezier(0.22, 1, 0.36, 1) var(--sp-delay) infinite;
  }
}

@keyframes sp-pulse {
  0% {
    opacity: 0.9;
    transform: scale(0.5);
  }
  70%,
  100% {
    opacity: 0;
    transform: scale(1.9);
  }
}
</style>
