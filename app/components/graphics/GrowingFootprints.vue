<script setup lang="ts">
/**
 * Huellas de tamaño creciente, de la infancia a la edad adulta (spec 04 §4, hero de podología infantil).
 * Aparecen en secuencia al montar; con reduced motion o sin JS se ven todas. Decorativo.
 */
import { FOOT_H, FOOT_W } from '~/utils/pressure'

const prints = [
  { x: 40, y: 300, s: 0.2, side: 'left' },
  { x: 108, y: 250, s: 0.27, side: 'right' },
  { x: 190, y: 196, s: 0.35, side: 'left' },
  { x: 290, y: 130, s: 0.44, side: 'right' },
  { x: 410, y: 60, s: 0.54, side: 'left' },
] as const
</script>

<template>
  <svg viewBox="0 0 520 420" class="growing w-full overflow-visible" aria-hidden="true" focusable="false">
    <path
      d="M30 400 C 150 360, 300 280, 470 60"
      fill="none"
      stroke="var(--color-ice-blue)"
      stroke-width="1.5"
      stroke-dasharray="2 7"
      stroke-linecap="round"
    />
    <g
      v-for="(p, i) in prints"
      :key="i"
      class="print"
      :style="{ '--i': i }"
      :transform="`translate(${p.x} ${p.y}) rotate(28) scale(${p.s}) translate(${-FOOT_W / 2} ${-FOOT_H / 2})`"
    >
      <Footprint :side="p.side" :variant="i === prints.length - 1 ? 'both' : 'fill'" />
    </g>
  </svg>
</template>

<style scoped>
.growing {
  --fp-fill: var(--color-ice-blue);
}
.print:last-of-type {
  --fp-fill: var(--color-light-blue);
}
.print {
  animation: grow-in 700ms var(--ease-out-soft) both;
  animation-delay: calc(var(--i) * 180ms + 250ms);
}
@keyframes grow-in {
  from {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .print {
    animation: none;
  }
}
</style>
