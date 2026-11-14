<script setup lang="ts">
/**
 * Una reseña (spec 03 §4): card compacta con la cita y una firma de una línea («Nombre · ★★★★★ · Google»).
 * La huella que la marca y el camino que las une los pone `ReviewsSection`.
 */
import type { Review } from '~/data/reviews'

defineProps<{ review: Review }>()
</script>

<template>
  <figure class="review">
    <blockquote class="review__text">
      <p>{{ review.text }}</p>
    </blockquote>

    <figcaption class="review__by">
      <span class="review__name">{{ review.author }}</span>
      <template v-if="review.rating">
        <span class="review__sep" aria-hidden="true">·</span>
        <span class="review__rating">
          <svg
            v-for="n in 5"
            :key="n"
            viewBox="0 0 16 16"
            :class="{ 'is-off': n > review.rating }"
            aria-hidden="true"
          >
            <path d="m8 1.5 1.9 4 4.4.5-3.3 3 .9 4.3L8 11.1 4.1 13.3 5 9 1.7 6l4.4-.5Z" />
          </svg>
          <span class="sr-only">{{ review.rating }} de 5</span>
        </span>
      </template>
      <span class="review__sep" aria-hidden="true">·</span>
      <a :href="review.url" target="_blank" rel="noopener" class="review__source">
        {{ review.source }}<span class="sr-only">: ver reseña (se abre en una pestaña nueva)</span>
      </a>
    </figcaption>
  </figure>
</template>

<style scoped>
/* Card compacta con el radio del resto de cards del sitio (--radius-l) */
.review {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  max-width: 26rem;
  padding: clamp(1rem, 1.6vw, 1.375rem);
  background: var(--color-white);
  border: 1px solid rgb(255 255 255 / 0.9);
  border-radius: var(--radius-l);
}
.review__text p {
  font-family: var(--font-display);
  font-size: clamp(1rem, 0.95rem + 0.3vw, 1.125rem);
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: -0.008em;
  text-wrap: pretty;
  color: var(--color-ink);
}

.review__by {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.625rem;
  font-size: var(--text-small);
  line-height: 1.3;
  color: var(--color-text-secondary);
}
.review__name {
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-ink);
}
.review__rating {
  display: inline-flex;
  gap: 0.1rem;
  color: var(--color-primary);
}
.review__rating svg {
  width: 0.875rem;
  height: 0.875rem;
  fill: currentColor;
  stroke: currentColor;
  stroke-width: 1;
  stroke-linejoin: round;
}
.review__rating svg.is-off {
  fill: none;
  opacity: 0.45;
}
/* Google: procedencia en segundo plano, solo el nombre subrayado */
.review__source {
  color: var(--color-text-secondary);
  text-decoration: underline;
  text-decoration-color: rgb(6 26 44 / 0.3);
  text-underline-offset: 4px;
  transition:
    color var(--dur-fast) var(--ease-out-soft),
    text-decoration-color var(--dur-fast) var(--ease-out-soft);
}
.review__source:hover {
  color: var(--color-primary-strong);
  text-decoration-color: currentColor;
}
</style>
