<script setup lang="ts">
/**
 * Set mínimo de iconos utilitarios propio (spec 01 §7): mismo trazo que el lenguaje gráfico (1.5 px,
 * terminaciones redondeadas). No ilustra servicios: para eso están los recursos de `graphics/`.
 * Decorativo por defecto (aria-hidden); con `label` se anuncia como imagen.
 */
export type IconName =
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up-right'
  | 'phone'
  | 'mail'
  | 'instagram'
  | 'linkedin'
  | 'map-pin'
  | 'clock'
  | 'close'
  | 'plus'
  | 'check'
  | 'alert'
  | 'info'
  | 'copy'
  | 'route'

withDefaults(defineProps<{ name: IconName; label?: string }>(), { label: undefined })

const paths: Record<IconName, string[]> = {
  'arrow-right': ['M4 12h15', 'M13 6l6 6-6 6'],
  'arrow-left': ['M20 12H5', 'M11 6l-6 6 6 6'],
  'arrow-up-right': ['M7 17 17 7', 'M8 7h9v9'],
  phone: [
    'M5 4h3.2l1.6 4-2.1 1.3a11 11 0 0 0 5 5l1.3-2.1 4 1.6V17a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z',
  ],
  mail: [
    'M3.5 6.5A1.5 1.5 0 0 1 5 5h14a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5Z',
    'm4 7 8 6 8-6',
  ],
  instagram: [
    'M7.5 3.5h9a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4Z',
    'M12 8.2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6Z',
    'M17.2 6.8h.01',
  ],
  linkedin: [
    'M5 3.5h14A1.5 1.5 0 0 1 20.5 5v14a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5Z',
    'M8 10.5V16',
    'M8 7.6v.01',
    'M11.5 16v-5.5',
    'M11.5 13a2.5 2.5 0 0 1 5 0v3',
  ],
  'map-pin': [
    'M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11Z',
    'M12 7.8a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4Z',
  ],
  clock: ['M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17Z', 'M12 7.5V12l3 2'],
  close: ['M6 6l12 12', 'M18 6 6 18'],
  plus: ['M12 5v14', 'M5 12h14'],
  check: ['m5 12.5 4.5 4.5L19 7.5'],
  alert: ['M12 3.8 21 19.5H3Z', 'M12 10v4.2', 'M12 17v.01'],
  info: ['M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17Z', 'M12 11v5', 'M12 8v.01'],
  copy: ['M9 9h10v11H9Z', 'M5 15V4h10'],
  route: [
    'M6 19a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z',
    'M18 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z',
    'M8 17h7.5a3 3 0 0 0 0-6h-7a3 3 0 0 1 0-6H16',
  ],
}
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    focusable="false"
    class="base-icon"
  >
    <path v-for="(d, i) in paths[name]" :key="i" :d="d" />
  </svg>
</template>

<style>
/* En la capa `components`: las utilidades (size-5…) del consumidor ganan (ver CSS con ámbito vs Tailwind). */
@layer components {
  .base-icon {
    flex: none;
    width: 1.25em;
    height: 1.25em;
  }
}
</style>
