<script setup lang="ts">
/** Autor, valoración (estrellas SVG + texto) y procedencia de una reseña (spec 03 §4). */
import type { Review } from '~/data/reviews'

defineProps<{ review: Review }>()
</script>

<template>
  <figcaption class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-secondary">
    <span class="font-semibold text-deep-blue">{{ review.author }}</span>
    <span v-if="review.rating" class="inline-flex items-center gap-1">
      <svg
        v-for="n in 5"
        :key="n"
        viewBox="0 0 16 16"
        class="size-3.5"
        :class="n <= review.rating ? 'text-primary' : 'text-border-strong'"
        aria-hidden="true"
      >
        <path
          d="m8 1.5 1.9 4 4.4.5-3.3 3 .9 4.3L8 11.1 4.1 13.3 5 9 1.7 6l4.4-.5Z"
          :fill="n <= review.rating ? 'currentColor' : 'none'"
          stroke="currentColor"
          stroke-width="1"
          stroke-linejoin="round"
        />
      </svg>
      <span class="sr-only">{{ review.rating }} de 5</span>
    </span>
    <a :href="review.url" target="_blank" rel="noopener" class="underline underline-offset-4">
      Reseña de {{ review.source }}<span class="sr-only"> (se abre en una pestaña nueva)</span>
    </a>
  </figcaption>
</template>
