<script setup lang="ts">
/**
 * CTA final de página (plan §2.3, spec 03 §5). Titular con palabra destacada + texto opcional + botón y un
 * `FootprintTrail` que recorre una curva hacia el botón (vertical en móvil).
 * Fondo light-blue con `--grad-mist`.
 */
import type { Maybe } from '#shared/utils/pending'

defineProps<{
  title: { before: string; accent: string; after?: string }
  text?: Maybe<string>
  cta: { label: string; to: string }
  /** Botón secundario opcional (p. ej. llamar). */
  secondary?: { label: string; to?: string; href?: string }
}>()
</script>

<template>
  <section class="cta section-clip relative isolate py-(--space-section)">
    <!-- Escritorio/tablet: la curva sube desde abajo a la izquierda hacia el botón -->
    <div class="trail trail-wide">
      <FootprintTrail
        :steps="8"
        :width="640"
        :height="300"
        :from="[20, 290]"
        :control="[300, 300]"
        :to="[630, 120]"
      />
    </div>
    <div class="container-site relative text-center">
      <div class="trail-narrow mx-auto mb-8 w-24">
        <FootprintTrail
          :steps="6"
          :width="120"
          :height="260"
          :from="[60, 250]"
          :control="[20, 130]"
          :to="[60, 10]"
          :scale="0.15"
          :stride="14"
        />
      </div>
      <h2 v-reveal class="mx-auto max-w-[18ch] font-display text-display-l text-deep-blue">
        {{ title.before }}<em class="text-primary">{{ title.accent }}</em
        >{{ title.after ?? '.' }}
      </h2>
      <ContentValue
        v-if="text"
        v-reveal="1"
        :value="text"
        as="p"
        class="mx-auto mt-6 max-w-[48ch] text-body-l text-text-secondary"
      />
      <div v-reveal="2" class="mt-10 flex flex-wrap justify-center gap-3">
        <BaseButton :to="cta.to" arrow>{{ cta.label }}</BaseButton>
        <BaseButton v-if="secondary" :to="secondary.to" :href="secondary.href" variant="secondary">{{
          secondary.label
        }}</BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta {
  background: var(--grad-mist);
  --fp-fill: var(--color-primary);
}
.trail {
  position: absolute;
  pointer-events: none;
}
.trail-wide {
  display: none;
}
@media (min-width: 768px) {
  .trail-wide {
    display: block;
    left: 0;
    bottom: 8%;
    width: min(42vw, 560px);
    opacity: 0.55;
  }
  .trail-narrow {
    display: none;
  }
}
</style>
