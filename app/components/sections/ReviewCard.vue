<script setup lang="ts">
/**
 * Una reseña (spec 03 §4) como tarjeta de papel sobre el capítulo azul: avatar con inicial, nombre, logotipo de
 * Google como procedencia, estrellas, cita y enlace a la ficha.
 */
import type { Review } from '~/data/reviews'

const props = defineProps<{ review: Review }>()

const initial = computed(() => props.review.author.trim().charAt(0).toUpperCase())
</script>

<template>
  <figure class="review">
    <span class="review__mark" aria-hidden="true">“</span>

    <figcaption class="review__who">
      <span class="review__avatar" aria-hidden="true">{{ initial }}</span>
      <span class="review__id">
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
      </span>
      <svg class="review__google" viewBox="0 0 48 48" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17Z"
        />
        <path
          fill="#34A853"
          d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46Z"
        />
        <path
          fill="#FBBC05"
          d="M11.69 28.18A13.8 13.8 0 0 1 10.96 24c0-1.45.25-2.86.73-4.18v-5.7H4.34A22 22 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7Z"
        />
        <path
          fill="#EA4335"
          d="M24 9.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 3.19 29.93 1 24 1 15.4 1 7.96 5.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07Z"
        />
      </svg>
    </figcaption>

    <blockquote class="review__text">
      <p>{{ review.text }}</p>
    </blockquote>

    <a :href="review.url" target="_blank" rel="noopener" class="review__source">
      Ver reseña en {{ review.source }}<span class="sr-only"> (se abre en una pestaña nueva)</span>
    </a>
  </figure>
</template>

<style scoped>
.review {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: clamp(1.5rem, 2.4vw, 2rem);
  overflow: hidden;
  background: var(--color-white);
  color: var(--color-text);
  border: 1px solid rgb(255 255 255 / 0.9);
  border-radius: var(--radius-l);
  box-shadow: 0 20px 44px -22px rgb(18 112 182 / 0.35);
}
.review__mark {
  position: absolute;
  bottom: -2.75rem;
  right: 1.25rem;
  font-family: var(--font-display);
  font-size: 9rem;
  font-weight: 700;
  line-height: 1;
  color: var(--color-primary);
  opacity: 0.12;
  pointer-events: none;
}

.review__who {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}
.review__avatar {
  display: grid;
  flex: none;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  color: var(--color-bone);
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 600;
}
.review__id {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}
.review__name {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--color-ink);
}
.review__rating {
  display: flex;
  gap: 0.1rem;
  color: var(--color-primary);
}
.review__rating svg {
  width: 1rem;
  height: 1rem;
  fill: currentColor;
  stroke: currentColor;
  stroke-width: 1;
  stroke-linejoin: round;
}
.review__rating svg.is-off {
  fill: none;
  opacity: 0.45;
}
.review__google {
  flex: none;
  width: 1.375rem;
  height: 1.375rem;
  margin-left: auto;
  align-self: flex-start;
}

.review__text p {
  font-size: var(--text-body);
  line-height: 1.6;
  color: var(--color-text);
}
.review__source {
  align-self: flex-start;
  font-size: var(--text-small);
  color: var(--color-primary-strong);
  text-decoration: underline;
  text-underline-offset: 4px;
}
</style>
