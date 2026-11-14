<script setup lang="ts">
/**
 * Reseñas (spec 03 §4): capítulo azul de marca, sin tarjetas. Las reseñas son lo que manda: cada una es una fila
 * entre filetes, con la cita a escala de titular y el autor en la columna lateral. La nota de la ficha de Google va
 * en la cabecera, con las estrellas rellenas hasta la nota exacta.
 * **Si `reviews` está vacía, la sección no se renderiza** (solo reseñas reales con permiso).
 * Más de 6 reseñas → carrusel accesible (pendiente: no hay datos que lo justifiquen todavía).
 */
import { googleSummary, reviews } from '~/data/reviews'

const shown = computed(() => reviews.slice(0, 6))
const rating = googleSummary.rating.toLocaleString('es-ES', { minimumFractionDigits: 1 })
/** Porcentaje de estrellas rellenas (4,7 de 5 → 94 %). */
const fill = `${(googleSummary.rating / 5) * 100}%`

const STAR = 'm8 1.5 1.9 4 4.4.5-3.3 3 .9 4.3L8 11.1 4.1 13.3 5 9 1.7 6l4.4-.5Z'
</script>

<template>
  <section
    v-if="shown.length"
    class="reviews chapter-blue section-clip"
    data-nav-theme="blue"
    aria-labelledby="resenas-title"
  >
    <div class="container-wide">
      <header class="reviews__head">
        <h2 id="resenas-title" v-reveal class="text-display-l">Opiniones</h2>

        <a
          v-reveal="1"
          :href="googleSummary.url"
          target="_blank"
          rel="noopener"
          class="reviews__score"
        >
          <span class="reviews__stars" :style="{ '--fill': fill }" aria-hidden="true">
            <span v-for="layer in 2" :key="layer" class="reviews__stars-row">
              <svg v-for="n in 5" :key="n" viewBox="0 0 16 16">
                <path :d="STAR" />
              </svg>
            </span>
          </span>
          <span class="reviews__score-text">
            <strong>{{ rating }} de 5</strong> en {{ googleSummary.count }} opiniones de Google
            <span class="sr-only">(se abre en una pestaña nueva)</span>
          </span>
        </a>
      </header>

      <ul class="reviews__list" role="list">
        <li v-for="(review, i) in shown" :key="i" v-reveal="i" class="reviews__item">
          <ReviewCard :review="review" />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.reviews {
  padding-block: clamp(3.5rem, 7vw, 6.5rem);
}

.reviews__head {
  display: grid;
  gap: 1.5rem;
  align-items: end;
}

/* Nota de Google: estrellas con dos capas, la de arriba recortada a la nota exacta */
.reviews__score {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  justify-self: start;
  color: var(--color-bone);
  font-size: var(--text-small);
  line-height: 1.3;
}
.reviews__stars {
  position: relative;
  display: inline-block;
  line-height: 0;
}
.reviews__stars-row {
  display: flex;
  gap: 0.2rem;
}
.reviews__stars-row svg {
  width: 1.125rem;
  height: 1.125rem;
}
.reviews__stars-row:first-child path {
  fill: none;
  stroke: currentColor;
  stroke-width: 1;
  stroke-linejoin: round;
  opacity: 0.7;
}
.reviews__stars-row:last-child {
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--fill);
  overflow: hidden;
}
.reviews__stars-row:last-child svg {
  flex: none;
}
.reviews__stars-row:last-child path {
  fill: currentColor;
  stroke: currentColor;
  stroke-width: 1;
  stroke-linejoin: round;
}
.reviews__score-text {
  text-decoration: underline;
  text-decoration-color: rgb(241 239 233 / 0.55);
  text-underline-offset: 4px;
  transition: text-decoration-color var(--dur-fast) var(--ease-out-soft);
}
.reviews__score-text strong {
  font-weight: 600;
}
.reviews__score:hover .reviews__score-text {
  text-decoration-color: currentColor;
}

.reviews__list {
  margin-top: clamp(2rem, 4vw, 3.5rem);
  border-bottom: 1px solid var(--color-border);
}
.reviews__item {
  min-width: 0;
  border-top: 1px solid var(--color-border);
}

@media (min-width: 1024px) {
  .reviews__head {
    grid-template-columns: minmax(0, 1fr) auto;
  }
  .reviews__score {
    justify-self: end;
    padding-bottom: 0.75rem;
  }
}
</style>
