<script setup lang="ts">
/**
 * Una reseña (spec 03 §4) como fila editorial, no como tarjeta: autor, nota y procedencia en la columna lateral,
 * la cita a escala de titular en la principal. Pensada para el capítulo azul (`chapter-blue`).
 */
import type { Review } from '~/data/reviews'

defineProps<{ review: Review }>()
</script>

<template>
  <figure class="review">
    <figcaption class="review__who">
      <span class="review__name">{{ review.author }}</span>
      <span v-if="review.rating" class="review__rating">
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
      <a :href="review.url" target="_blank" rel="noopener" class="review__source">
        Reseña de {{ review.source }}<span class="sr-only"> (se abre en una pestaña nueva)</span>
      </a>
    </figcaption>

    <blockquote class="review__text">
      <p>{{ review.text }}</p>
    </blockquote>
  </figure>
</template>

<style scoped>
.review {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
  padding-block: clamp(1.75rem, 3.5vw, 3rem);
}

/* En móvil el autor va debajo de la cita (se lee primero lo que dice, luego quién) */
.review__text {
  order: -1;
}
.review__text p {
  max-width: 38ch;
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 0.95rem + 1.3vw, 1.875rem);
  font-weight: 500;
  line-height: 1.22;
  letter-spacing: -0.015em;
  text-wrap: pretty;
  color: var(--color-bone);
}

.review__who {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: var(--text-small);
  line-height: 1.3;
}
.review__name {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-bone);
}
.review__rating {
  display: flex;
  gap: 0.15rem;
  color: var(--color-bone);
}
.review__rating svg {
  width: 0.9375rem;
  height: 0.9375rem;
  fill: currentColor;
  stroke: currentColor;
  stroke-width: 1;
  stroke-linejoin: round;
}
.review__rating svg.is-off {
  fill: none;
  opacity: 0.55;
}
.review__source {
  color: var(--color-bone);
  text-decoration: underline;
  text-decoration-color: rgb(241 239 233 / 0.55);
  text-underline-offset: 4px;
  transition: text-decoration-color var(--dur-fast) var(--ease-out-soft);
}
.review__source:hover {
  text-decoration-color: currentColor;
}

@media (min-width: 1024px) {
  .review {
    grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
    gap: clamp(2rem, 4vw, 4rem);
    align-items: start;
  }
  .review__text {
    order: 0;
    grid-column: 2;
    grid-row: 1;
  }
  .review__who {
    grid-column: 1;
    grid-row: 1;
    padding-top: 0.35rem;
  }
  /* La comilla cuelga fuera del bloque de texto, como en un libro */
  .review__text p {
    position: relative;
  }
  .review__text p::before {
    content: '“';
    position: absolute;
    right: 100%;
    margin-right: 0.12em;
    color: var(--color-ice-blue);
    opacity: 0.7;
  }
}
</style>
