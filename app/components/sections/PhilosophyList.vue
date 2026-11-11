<script setup lang="ts">
/** Los cuatro verbos de la filosofía de la clínica (Escuchar · Analizar · Tratar · Prevenir) como lista tipográfica. */
import { clinic } from '~/data/clinic'
</script>

<template>
  <ol role="list">
    <li v-for="(step, i) in clinic.philosophy" :key="step.title" v-reveal class="step">
      <span class="step__num eyebrow">0{{ i + 1 }}</span>
      <h3 class="step__title text-display-l">{{ step.title }}</h3>
      <ContentValue :value="step.text" as="p" class="step__text text-body-l text-text-secondary" />
    </li>
  </ol>
</template>

<style scoped>
.step {
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr);
  column-gap: 0.5rem;
  border-top: 1px solid var(--color-border);
  padding-block: clamp(1.5rem, 3vw, 2.5rem);
}
.step:last-child {
  border-bottom: 1px solid var(--color-border);
}
.step__num {
  padding-top: 0.75em;
  color: var(--color-primary-strong);
  font-variant-numeric: tabular-nums;
}
.step__title {
  color: var(--color-ink);
  transition:
    color var(--dur-base) var(--ease-out-soft),
    transform var(--dur-base) var(--ease-out-soft);
}
.step__text {
  grid-column: 2;
  margin-top: 0.75rem;
  max-width: 34ch;
}
@media (hover: hover) and (pointer: fine) {
  .step:hover .step__title {
    color: var(--color-primary);
    transform: translateX(0.75rem);
  }
}
@media (prefers-reduced-motion: reduce) {
  .step__title {
    transition: color 150ms linear;
  }
  .step:hover .step__title {
    transform: none;
  }
}
</style>
