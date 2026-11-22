<script setup lang="ts">
/**
 * Huella plantar izquierda o derecha (spec 08 §3). Se renderiza como `<g>` para componerla dentro de otro
 * `<svg>` en coordenadas de huella (FOOT_W × FOOT_H). Variantes: contorno, relleno o ambos.
 */
import { FOOT_W, SOLE_PATH, TOES, type FootSide } from '~/utils/pressure'

const props = withDefaults(
  defineProps<{
    side?: FootSide
    variant?: 'outline' | 'fill' | 'both'
    /** Grosor del trazo en unidades de la huella. */
    strokeWidth?: number
  }>(),
  { side: 'right', variant: 'both', strokeWidth: 1.1 },
)

const mirror = computed(() => (props.side === 'left' ? `translate(${FOOT_W} 0) scale(-1 1)` : undefined))
const fill = computed(() =>
  props.variant === 'outline' ? 'none' : 'var(--fp-fill, var(--color-light-blue))',
)
const stroke = computed(() => (props.variant === 'fill' ? 'none' : 'var(--fp-stroke, var(--color-primary))'))
</script>

<template>
  <g :transform="mirror" :fill="fill" :stroke="stroke" :stroke-width="strokeWidth" stroke-linejoin="round">
    <path :d="SOLE_PATH" />
    <ellipse
      v-for="(toe, i) in TOES"
      :key="i"
      :cx="toe.cx"
      :cy="toe.cy"
      :rx="toe.rx"
      :ry="toe.ry"
      :transform="`rotate(${toe.rot} ${toe.cx} ${toe.cy})`"
    />
  </g>
</template>
