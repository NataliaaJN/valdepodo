<script setup lang="ts">
/**
 * Pasos numerados con línea de recorrido (plan §2.3). Horizontal en escritorio (≥ 1024) con `horizontal`,
 * vertical en el resto. La línea se dibuja al entrar en viewport (`v-reveal`).
 */
import type { Maybe } from '#shared/utils/pending'

withDefaults(
  defineProps<{
    steps: readonly { title: string; text: Maybe<string>; link?: { label: string; to: string } }[]
    horizontal?: boolean
  }>(),
  { horizontal: false },
)
</script>

<template>
  <ol class="step-list" :class="{ 'is-horizontal': horizontal }" :style="{ '--n': steps.length }">
    <li v-for="(step, i) in steps" :key="step.title" v-reveal="i" class="step">
      <span class="step-line" aria-hidden="true" />
      <span class="step-dot" aria-hidden="true" />
      <span class="eyebrow text-primary-strong">{{ String(i + 1).padStart(2, '0') }}</span>
      <h3 class="mt-2 text-heading-s text-deep-blue">{{ step.title }}</h3>
      <ContentValue :value="step.text" as="p" class="mt-2 max-w-[34ch] text-text-secondary" />
      <NuxtLink
        v-if="step.link"
        :to="step.link.to"
        class="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary-strong underline underline-offset-4"
      >
        {{ step.link.label }} <BaseIcon name="arrow-right" class="size-4" />
      </NuxtLink>
    </li>
  </ol>
</template>

<style scoped>
.step-list {
  display: grid;
  gap: 2.5rem;
}
.step {
  position: relative;
  padding-left: 2.5rem;
}
.step-dot {
  position: absolute;
  left: 0;
  top: 0.55rem;
  width: 13px;
  height: 13px;
  border-radius: 999px;
  border: 1.5px solid var(--color-primary);
  background: var(--color-surface);
}
.step-line {
  position: absolute;
  left: 6px;
  top: 1.6rem;
  bottom: -2.5rem;
  width: 1.5px;
  background: var(--color-primary);
  opacity: 0.4;
  transform-origin: top;
  transition: transform 900ms var(--ease-out-soft) 200ms;
}
.step:last-child .step-line {
  display: none;
}
[data-rv='out'] > .step-line {
  transform: scaleY(0);
}

@media (min-width: 1024px) {
  .is-horizontal {
    grid-template-columns: repeat(var(--n), minmax(0, 1fr));
    gap: 2rem;
  }
  .is-horizontal .step {
    padding-left: 0;
    padding-top: 2.5rem;
  }
  .is-horizontal .step-dot {
    top: 0;
  }
  .is-horizontal .step-line {
    left: 1.5rem;
    right: -2rem;
    top: 6px;
    bottom: auto;
    width: auto;
    height: 1.5px;
    background: var(--color-primary);
    transform-origin: left;
  }
  .is-horizontal[data-rv='out'] > .step-line,
  .is-horizontal [data-rv='out'] > .step-line {
    transform: scaleX(0);
  }
}
</style>
