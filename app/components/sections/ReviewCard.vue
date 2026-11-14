<script setup lang="ts">
/**
 * Una reseña (spec 03 §4): card compacta con estrellas, cita y firma (avatar con la inicial, nombre y la
 * procedencia en Google, enlazada a la ficha). Sin fotos: solo hay nombre abreviado y su permiso.
 */
import type { Review } from '~/data/reviews'

const props = defineProps<{ review: Review }>()

const initial = computed(() => props.review.author.trim().charAt(0).toUpperCase())
</script>

<template>
  <figure class="review">
    <div v-if="review.rating" class="review__stars">
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
    </div>

    <blockquote class="review__text">
      <p>{{ review.text }}</p>
    </blockquote>

    <figcaption class="review__by">
      <span class="review__avatar" aria-hidden="true">{{ initial }}</span>
      <span class="review__name">{{ review.author }}</span>
      <span class="review__divider" aria-hidden="true" />
      <a :href="review.url" target="_blank" rel="noopener" class="review__source">
        {{ review.source }}<span class="sr-only">: ver reseña (se abre en una pestaña nueva)</span>
      </a>
    </figcaption>
  </figure>
</template>

<style scoped>
.review {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  padding: clamp(1.25rem, 2vw, 1.75rem);
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-l);
}

.review__stars {
  display: flex;
  gap: 0.15rem;
  color: var(--color-primary-strong);
}
.review__stars svg {
  width: 1.125rem;
  height: 1.125rem;
  fill: currentColor;
  stroke: currentColor;
  stroke-width: 1;
  stroke-linejoin: round;
}
.review__stars svg.is-off {
  fill: none;
  opacity: 0.45;
}

.review__text {
  flex: 1;
}
.review__text p {
  font-size: var(--text-body);
  line-height: 1.65;
  color: var(--color-text-secondary-strong);
}

.review__by {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem 0.75rem;
  font-size: var(--text-small);
  line-height: 1.3;
}
.review__avatar {
  display: grid;
  flex: none;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
}
.review__name {
  font-weight: 600;
  color: var(--color-ink);
}
.review__divider {
  align-self: stretch;
  width: 1px;
  margin-block: 0.2rem;
  background: var(--color-border);
}
/* Google: procedencia en segundo plano */
.review__source {
  color: var(--color-primary-strong);
  text-decoration: underline;
  text-decoration-color: rgb(11 94 153 / 0.35);
  text-underline-offset: 4px;
  transition: text-decoration-color var(--dur-fast) var(--ease-out-soft);
}
.review__source:hover {
  text-decoration-color: currentColor;
}
</style>
