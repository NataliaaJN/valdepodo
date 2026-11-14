<script setup lang="ts">
/** Card de una reseña (spec 03 §4): valoración, cita, autor con inicial y procedencia enlazada. */
import type { Review } from '~/data/reviews'

const props = defineProps<{ review: Review }>()

const initial = computed(() => props.review.author.trim().charAt(0).toUpperCase())
</script>

<template>
  <figure class="review">
    <span class="review__mark" aria-hidden="true">“</span>
    <div v-if="review.rating" class="review__stars">
      <svg
        v-for="n in 5"
        :key="n"
        viewBox="0 0 16 16"
        class="size-4"
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
    </div>
    <blockquote class="review__text">
      <p>{{ review.text }}</p>
    </blockquote>
    <figcaption class="review__author">
      <span class="review__avatar" aria-hidden="true">{{ initial }}</span>
      <span class="flex flex-col">
        <span class="font-semibold text-ink">{{ review.author }}</span>
        <a :href="review.url" target="_blank" rel="noopener" class="review__source">
          Reseña de {{ review.source }}<span class="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
      </span>
    </figcaption>
  </figure>
</template>

<style scoped>
.review {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: 100%;
  padding: clamp(1.5rem, 2.4vw, 2.25rem);
  overflow: hidden;
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-l);
  transition: border-color var(--dur-base) var(--ease-out-soft);
}
.review__mark {
  position: absolute;
  top: -0.25rem;
  right: 1.25rem;
  font-family: var(--font-display);
  font-size: 8rem;
  font-weight: 700;
  line-height: 1;
  color: var(--color-primary);
  opacity: 0.1;
  pointer-events: none;
}
.review__stars {
  display: flex;
  gap: 0.2rem;
}
.review__text {
  flex: 1;
  font-size: var(--text-body-l);
  line-height: var(--text-body-l--line-height);
  color: var(--color-text);
}
.review__author {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);
  font-size: var(--text-small);
  line-height: 1.3;
}
.review__avatar {
  display: grid;
  flex: none;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-pill);
  background: var(--color-ink);
  color: var(--color-bone);
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
}
.review__source {
  color: var(--color-primary-strong);
  text-decoration: underline;
  text-underline-offset: 4px;
}

@media (hover: hover) and (pointer: fine) {
  .review:hover {
    border-color: var(--color-primary);
  }
}
</style>
