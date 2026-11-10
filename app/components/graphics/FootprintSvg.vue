<script setup lang="ts">
/** Huella suelta en su propio `<svg>` (decorativa). Para composiciones, usar `Footprint` dentro de un `<svg>`. */
import { FOOT_H, FOOT_W, type FootSide } from '~/utils/pressure'

withDefaults(defineProps<{ side?: FootSide; variant?: 'outline' | 'fill' | 'both' }>(), {
  side: 'right',
  variant: 'both',
})
</script>

<template>
  <svg
    :viewBox="`-2 -2 ${FOOT_W + 4} ${FOOT_H + 4}`"
    aria-hidden="true"
    focusable="false"
    class="overflow-visible"
  >
    <Footprint :side="side" :variant="variant" />
  </svg>
</template>
