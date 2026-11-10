<script setup lang="ts">
/**
 * Progreso del wizard (spec 06 §2): "Paso 2 de 5" + cinco huellas que se rellenan. El anuncio del cambio de
 * paso va en una región `aria-live="polite"`.
 */
import { FOOT_H, FOOT_W } from '~/utils/pressure'

defineProps<{ step: number; total: number; title: string }>()
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4">
    <p class="eyebrow text-primary-strong" aria-live="polite">
      Paso {{ step }} de {{ total }}<span class="sr-only">: {{ title }}</span>
    </p>
    <svg :viewBox="`0 0 ${total * 34} 40`" class="h-9 w-auto" aria-hidden="true" focusable="false">
      <g
        v-for="n in total"
        :key="n"
        class="progress-print"
        :class="{ 'is-done': n < step, 'is-current': n === step }"
        :transform="`translate(${(n - 1) * 34 + 16} ${n % 2 ? 22 : 18}) rotate(12) scale(0.13) translate(${-FOOT_W / 2} ${-FOOT_H / 2})`"
      >
        <Footprint :side="n % 2 ? 'left' : 'right'" variant="both" :stroke-width="9" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.progress-print {
  --fp-fill: var(--color-white);
  --fp-stroke: var(--color-border-strong);
  transition: opacity var(--dur-base) var(--ease-out-soft);
}
.progress-print.is-done {
  --fp-fill: var(--color-ice-blue);
  --fp-stroke: var(--color-primary);
}
.progress-print.is-current {
  --fp-fill: var(--color-primary);
  --fp-stroke: var(--color-primary);
}
</style>
