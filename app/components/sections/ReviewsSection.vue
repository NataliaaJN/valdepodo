<script setup lang="ts">
/**
 * Reseñas (spec 03 §4): capítulo azul. A la izquierda la nota de la ficha de Google (cifra grande, estrellas
 * rellenas hasta la nota exacta y enlace); a la derecha las reseñas como tarjetas escalonadas con avatar.
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
    <div class="container-wide reviews__layout">
      <div class="reviews__intro">
        <h2 id="resenas-title" v-reveal class="text-display-l">Opiniones</h2>

        <a
          v-reveal="1"
          :href="googleSummary.url"
          target="_blank"
          rel="noopener"
          class="reviews__score"
        >
          <span class="reviews__number" aria-hidden="true">{{ rating }}</span>
          <span class="reviews__score-side">
            <span class="reviews__stars" :style="{ '--fill': fill }" aria-hidden="true">
              <span v-for="layer in 2" :key="layer" class="reviews__stars-row">
                <svg v-for="n in 5" :key="n" viewBox="0 0 16 16">
                  <path :d="STAR" />
                </svg>
              </span>
            </span>
            <span class="reviews__score-text">
              <span class="sr-only">{{ rating }} de 5, </span>
              {{ googleSummary.count }} opiniones en Google
              <span class="sr-only">(se abre en una pestaña nueva)</span>
            </span>
          </span>
        </a>
      </div>

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
.reviews__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(2rem, 4vw, 3rem);
}

/* Nota de Google: cifra grande + estrellas con dos capas, la de arriba recortada a la nota exacta */
.reviews__score {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  margin-top: clamp(1.25rem, 2.5vw, 2rem);
  color: var(--color-bone);
}
.reviews__number {
  font-family: var(--font-display);
  font-size: clamp(4rem, 3rem + 4vw, 6.5rem);
  font-weight: 650;
  font-stretch: 75%;
  line-height: 0.85;
  letter-spacing: -0.03em;
}
.reviews__score-side {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: var(--text-small);
  line-height: 1.3;
}
.reviews__stars {
  position: relative;
  display: inline-block;
  align-self: flex-start;
  line-height: 0;
}
.reviews__stars-row {
  display: flex;
  gap: 0.2rem;
}
.reviews__stars-row svg {
  flex: none;
  width: 1.375rem;
  height: 1.375rem;
}
.reviews__stars-row path {
  stroke: currentColor;
  stroke-width: 1;
  stroke-linejoin: round;
}
.reviews__stars-row:first-child path {
  fill: none;
  opacity: 0.7;
}
.reviews__stars-row:last-child {
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--fill);
  overflow: hidden;
}
.reviews__stars-row:last-child path {
  fill: currentColor;
}
.reviews__score-text {
  text-decoration: underline;
  text-decoration-color: rgb(241 239 233 / 0.55);
  text-underline-offset: 4px;
  transition: text-decoration-color var(--dur-fast) var(--ease-out-soft);
}
.reviews__score:hover .reviews__score-text {
  text-decoration-color: currentColor;
}

.reviews__list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
  align-items: start;
}
.reviews__item {
  min-width: 0;
}

/* Tablet: dos columnas, la segunda desplazada hacia abajo para romper la rejilla */
@media (min-width: 768px) {
  .reviews__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
  }
  .reviews__item:nth-child(even) {
    margin-top: 3rem;
  }
}

/* Escritorio: nota a la izquierda (fija al hacer scroll), tarjetas escalonadas a la derecha */
@media (min-width: 1024px) {
  .reviews__layout {
    grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
    gap: clamp(2.5rem, 5vw, 5rem);
    align-items: start;
  }
  .reviews__intro {
    position: sticky;
    top: calc(var(--nav-h-compact) + 2rem);
  }
}
</style>
