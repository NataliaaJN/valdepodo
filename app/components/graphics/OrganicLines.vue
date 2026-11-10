<script setup lang="ts">
/**
 * Líneas orgánicas que "orbitan" un elemento (spec 01 §7, spec 03 §1). Decorativas (aria-hidden).
 * Elipses finas con giro muy lento; sin movimiento con reduced motion.
 */
withDefaults(defineProps<{ spin?: boolean }>(), { spin: true })

const rings = [
  { rx: 46, ry: 20, rotate: -18, dash: '0', opacity: 0.55, dur: 90 },
  { rx: 40, ry: 27, rotate: 24, dash: '1.2 2.4', opacity: 0.5, dur: 120 },
  { rx: 48, ry: 34, rotate: 62, dash: '0', opacity: 0.25, dur: 150 },
]
</script>

<template>
  <svg class="organic-lines" viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false">
    <g
      v-for="(ring, i) in rings"
      :key="i"
      class="ring"
      :class="{ spin }"
      :style="{ '--dur': `${ring.dur}s` }"
    >
      <ellipse
        cx="50"
        cy="50"
        :rx="ring.rx"
        :ry="ring.ry"
        :transform="`rotate(${ring.rotate} 50 50)`"
        :stroke-dasharray="ring.dash"
        :stroke-opacity="ring.opacity"
        stroke="var(--color-cyan)"
        stroke-width="0.18"
        vector-effect="non-scaling-stroke"
      />
    </g>
    <circle cx="88" cy="38" r="0.9" fill="var(--color-cyan)" class="spin ring" style="--dur: 90s" />
    <circle cx="14" cy="64" r="0.7" fill="var(--color-primary)" class="spin ring" style="--dur: 120s" />
  </svg>
</template>

<style scoped>
.organic-lines {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.organic-lines :deep(ellipse) {
  stroke-width: 1px;
}
.ring {
  transform-origin: 50px 50px;
  transform-box: view-box;
}
.ring.spin {
  animation: orbit var(--dur) linear infinite;
}
.ring:nth-child(2n).spin {
  animation-direction: reverse;
}
@keyframes orbit {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .ring.spin {
    animation: none;
  }
}
</style>
