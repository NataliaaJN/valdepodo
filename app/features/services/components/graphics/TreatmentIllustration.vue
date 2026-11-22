<script setup lang="ts">
/**
 * Ilustraciones lineales propias de los tratamientos de podología general (spec 04 §3). Esquemáticas, sin
 * fotografía clínica. Decorativas (aria-hidden).
 */
import type { TreatmentIllustration } from '~/features/services/data/treatments'

defineProps<{ kind: TreatmentIllustration }>()

/* Dedo gordo visto desde arriba, común a todas */
const TOE = 'M60 150 C 52 110, 52 64, 68 40 C 80 22, 120 22, 132 40 C 148 64, 148 110, 140 150'
const NAIL = 'M76 72 C 74 52, 84 40, 100 40 C 116 40, 126 52, 124 72 C 116 78, 84 78, 76 72 Z'
</script>

<template>
  <svg
    viewBox="0 0 200 170"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    class="treatment-illustration"
  >
    <path :d="TOE" stroke="var(--color-primary)" stroke-width="1.5" />
    <template v-if="kind === 'ingrown'">
      <path :d="NAIL" stroke="var(--color-primary)" stroke-width="1.5" fill="var(--color-light-blue)" />
      <path d="M76 72 C 70 74, 66 70, 66 64" stroke="var(--color-cyan)" stroke-width="2" />
      <circle cx="68" cy="68" r="12" stroke="var(--color-cyan)" stroke-width="1.25" stroke-dasharray="2 4" />
      <path d="M150 64 l14 -6 M152 78 h16 M150 92 l14 6" stroke="var(--color-ice-blue)" stroke-width="1.5" />
    </template>
    <template v-else-if="kind === 'wart'">
      <path :d="NAIL" stroke="var(--color-primary)" stroke-width="1.5" />
      <circle
        cx="100"
        cy="118"
        r="10"
        fill="var(--color-light-blue)"
        stroke="var(--color-cyan)"
        stroke-width="1.5"
      />
      <path d="M95 114 l3 3 M103 115 l-2 3 M98 122 h5" stroke="var(--color-cyan)" stroke-width="1.25" />
      <circle
        cx="100"
        cy="118"
        r="22"
        stroke="var(--color-ice-blue)"
        stroke-width="1.25"
        stroke-dasharray="2 4"
      />
    </template>
    <template v-else-if="kind === 'callus'">
      <path :d="NAIL" stroke="var(--color-primary)" stroke-width="1.5" />
      <ellipse
        cx="100"
        cy="128"
        rx="28"
        ry="12"
        fill="var(--color-light-blue)"
        stroke="var(--color-cyan)"
        stroke-width="1.5"
      />
      <path
        d="M80 128 h40 M86 122 h28 M86 134 h28"
        stroke="var(--color-cyan)"
        stroke-width="1"
        opacity="0.7"
      />
    </template>
    <template v-else>
      <path :d="NAIL" stroke="var(--color-primary)" stroke-width="1.5" />
      <path
        d="M140 150 C 150 120, 158 104, 172 100"
        stroke="var(--color-primary)"
        stroke-width="1.5"
        opacity="0.5"
      />
      <circle
        cx="140"
        cy="112"
        r="7"
        fill="var(--color-light-blue)"
        stroke="var(--color-cyan)"
        stroke-width="1.5"
      />
      <circle cx="140" cy="112" r="2" fill="var(--color-cyan)" />
      <path d="M128 100 l-6 -6 M152 100 l6 -6" stroke="var(--color-ice-blue)" stroke-width="1.5" />
    </template>
  </svg>
</template>

<style scoped>
.treatment-illustration {
  display: block;
  width: 100%;
  height: 100%;
}
.treatment-illustration :deep(path),
.treatment-illustration :deep(circle),
.treatment-illustration :deep(ellipse) {
  vector-effect: non-scaling-stroke;
}
</style>
