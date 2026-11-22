<script setup lang="ts">
/**
 * Líneas orgánicas que "orbitan" un elemento (spec 01 §7, spec 03 §1). Decorativas (aria-hidden).
 * Elipses finas con giro muy lento; sin movimiento con reduced motion.
 * Cada anillo es un SVG propio dentro de un div que gira con `transform`: la animación va en el compositor
 * (girar un <g> dentro del SVG obliga a repintar en el hilo principal en cada fotograma).
 */
withDefaults(defineProps<{ spin?: boolean }>(), { spin: true })

const rings = [
  { rx: 46, ry: 20, rotate: -18, dash: '0', opacity: 0.55, dur: 90, dot: { cx: 88, cy: 38, color: 'cyan' } },
  {
    rx: 40,
    ry: 27,
    rotate: 24,
    dash: '1.2 2.4',
    opacity: 0.5,
    dur: 120,
    dot: { cx: 14, cy: 64, color: 'primary' },
  },
  { rx: 48, ry: 34, rotate: 62, dash: '0', opacity: 0.25, dur: 150, dot: null },
]
</script>

<template>
  <div class="organic-lines" aria-hidden="true">
    <div
      v-for="(ring, i) in rings"
      :key="i"
      class="orbit-ring"
      :class="{ spin, reverse: i % 2 === 1 }"
      :style="{ '--dur': `${ring.dur}s` }"
    >
      <svg viewBox="0 0 100 100" fill="none" focusable="false">
        <ellipse
          cx="50"
          cy="50"
          :rx="ring.rx"
          :ry="ring.ry"
          :transform="`rotate(${ring.rotate} 50 50)`"
          :stroke-dasharray="ring.dash"
          :stroke-opacity="ring.opacity"
          stroke="var(--color-cyan)"
          stroke-width="1"
          vector-effect="non-scaling-stroke"
        />
        <circle
          v-if="ring.dot"
          :cx="ring.dot.cx"
          :cy="ring.dot.cy"
          r="0.9"
          :fill="`var(--color-${ring.dot.color})`"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.organic-lines {
  position: relative;
  width: 100%;
  height: 100%;
}
.orbit-ring {
  position: absolute;
  inset: 0;
}
.orbit-ring svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.orbit-ring.spin {
  animation: orbit var(--dur) linear infinite;
  will-change: transform;
}
.orbit-ring.reverse {
  animation-direction: reverse;
}
@keyframes orbit {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .orbit-ring.spin {
    animation: none;
  }
}
</style>
