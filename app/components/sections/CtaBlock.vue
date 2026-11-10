<script setup lang="ts">
/**
 * CTA final de página (plan §2.3). Titular con palabra destacada + botón + rastro de huellas decorativo.
 * Versión de la propuesta visual (Fase 5); el `FootprintTrail` animado completo llega en la Fase 6.
 */
defineProps<{
  title: { before: string; accent: string; after?: string }
  cta: { label: string; to: string }
}>()

const steps = [
  { x: 6, y: 74, r: -14, side: 'left' },
  { x: 15, y: 58, r: -8, side: 'right' },
  { x: 24, y: 70, r: -4, side: 'left' },
  { x: 33, y: 52, r: 2, side: 'right' },
] as const
</script>

<template>
  <section class="cta section-clip relative isolate py-(--space-section)">
    <div class="trail" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMinYMid meet" class="size-full overflow-visible">
        <g
          v-for="(s, i) in steps"
          :key="i"
          :transform="`translate(${s.x} ${s.y}) rotate(${s.r}) scale(0.07)`"
          :style="{ opacity: 0.25 + i * 0.18 }"
        >
          <Footprint :side="s.side" variant="fill" />
        </g>
      </svg>
    </div>
    <div class="container-site relative text-center">
      <h2 class="mx-auto max-w-[18ch] font-display text-display-l text-deep-blue">
        {{ title.before }}<em class="text-primary">{{ title.accent }}</em
        >{{ title.after ?? '.' }}
      </h2>
      <div class="mt-10 flex justify-center">
        <BaseButton :to="cta.to" arrow>{{ cta.label }}</BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta {
  background: var(--grad-mist);
}
.trail {
  position: absolute;
  inset: 0 auto 0 0;
  width: min(60vw, 720px);
  pointer-events: none;
  --fp-fill: var(--color-ice-blue);
}
</style>
