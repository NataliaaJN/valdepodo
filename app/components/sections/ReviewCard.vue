<script setup lang="ts">
/**
 * Una reseña (spec 03 §4) como pieza editorial, no como tarjeta de UI.
 * - `featured`: la protagonista; la cita a escala de titular, sin caja, con un filete de tinta a la izquierda.
 * - `note`: reseña de apoyo; una hoja translúcida y plana (sin sombra ni radios) que se solapa con el campo gráfico.
 * Firma en una línea: «Nombre · ★★★★★ · Google», con Google en segundo plano.
 */
import type { Review } from '~/data/reviews'

withDefaults(defineProps<{ review: Review; variant?: 'featured' | 'note' }>(), {
  variant: 'note',
})
</script>

<template>
  <figure class="review" :class="`review--${variant}`">
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
.review {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  color: var(--color-text);
}

.review__text p {
  text-wrap: pretty;
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
/* Google: presencia secundaria, solo el nombre en gris azulado, subrayado fino */
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

/* ---------- Destacada ---------- */
.review--featured {
  gap: clamp(1.25rem, 2vw, 1.75rem);
  padding-left: clamp(1.25rem, 2.4vw, 2.25rem);
  border-left: 2px solid var(--color-ink);
}
.review--featured .review__text p {
  max-width: 32ch;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 1.05rem + 1.9vw, 2.625rem);
  font-weight: 500;
  line-height: 1.14;
  letter-spacing: -0.025em;
  color: var(--color-ink);
}
.review--featured .review__by {
  font-size: var(--text-body);
}

/* ---------- Nota de apoyo ---------- */
.review--note {
  gap: 1rem;
  padding: clamp(1.25rem, 2vw, 1.75rem);
  background: rgb(255 255 255 / 0.66);
  border: 1px solid rgb(255 255 255 / 0.9);
  border-top: 2px solid var(--color-primary);
  border-radius: 2px;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}
.review--note .review__text p {
  font-size: var(--text-body);
  line-height: 1.6;
}
</style>
