<script setup lang="ts">
/**
 * Reseñas (spec 03 §4). Con tres reseñas reales un carrusel o una rejilla serían demasiado: el formato es el de
 * la referencia, con el titular centrado en vertical a la izquierda (frase de apoyo, nota de Google y botón a la
 * ficha) y las cards a la derecha, escalonadas: una en el centro y dos apiladas.
 * - ≥ 768 px: escalonado. < 768 px: carrusel con scroll-snap (se desliza con el dedo; teclado con Tab entre los enlaces).
 * - Scroll: las cards entran una tras otra (ScrollTrigger.batch). El titular no se anima. Reduced motion: todo visible.
 * **Si `reviews` está vacía, la sección no se renderiza** (solo reseñas reales con permiso).
 * Más de 6 reseñas → carrusel con flechas (pendiente: no hay datos que lo justifiquen todavía).
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { googleSummary, reviews } from '~/data/reviews'

const root = ref<HTMLElement | null>(null)
const list = ref<HTMLElement | null>(null)

const shown = computed(() => reviews.slice(0, 6))
const rating = googleSummary.rating.toLocaleString('es-ES', { minimumFractionDigits: 1 })
/** Porcentaje de estrellas rellenas (4,7 de 5 → 94 %). */
const fill = `${(googleSummary.rating / 5) * 100}%`
const STAR = 'm8 1.5 1.9 4 4.4.5-3.3 3 .9 4.3L8 11.1 4.1 13.3 5 9 1.7 6l4.4-.5Z'

useGsapContext(root, (c) => {
  const cards = list.value ? gsap.utils.toArray<HTMLElement>(list.value.children) : []
  if (c.reduce || !cards.length) return undefined

  gsap.set(cards, { autoAlpha: 0, y: 56, scale: 0.97 })
  const triggers = ScrollTrigger.batch(cards, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.18,
        overwrite: true,
      }),
  })
  return () => triggers.forEach((t) => t.kill())
})
</script>

<template>
  <section
    v-if="shown.length"
    ref="root"
    class="reviews section-clip"
    data-nav-theme="bone"
    aria-labelledby="resenas-title"
  >
    <div class="container-wide reviews__layout">
      <div class="reviews__intro">
        <h2 id="resenas-title" class="reviews__title text-display-m">Lo que dicen nuestros pacientes</h2>
        <p class="reviews__lede">La confianza de quienes nos visitan también forma parte del tratamiento.</p>

        <p class="reviews__score">
          <span class="reviews__number" aria-hidden="true">{{ rating }}</span>
          <span class="reviews__stars" :style="{ '--fill': fill }" aria-hidden="true">
            <span v-for="layer in 2" :key="layer" class="reviews__stars-row">
              <svg v-for="n in 5" :key="n" viewBox="0 0 16 16">
                <path :d="STAR" />
              </svg>
            </span>
          </span>
          <span class="reviews__count">
            <span class="sr-only">{{ rating }} de 5, </span>
            {{ googleSummary.count }} opiniones en Google
          </span>
        </p>

        <BaseButton :href="googleSummary.url" target="_blank" rel="noopener" arrow class="reviews__cta">
          Ver todas las opiniones<span class="sr-only"> en Google (se abre en una pestaña nueva)</span>
        </BaseButton>
      </div>

      <ul ref="list" class="reviews__list" role="list" aria-label="Opiniones de pacientes">
        <li v-for="(review, i) in shown" :key="i" class="reviews__item">
          <ReviewCard :review="review" />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.reviews {
  padding-block: clamp(3.5rem, 8vw, 7rem);
  /* Cian muy claro: el mismo de la pausa de datos, para que no se funda con el pre-footer azul */
  background: linear-gradient(180deg, #e6f6fc 0%, #d9f0fa 100%);
  color: var(--color-ink);
}

.reviews__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 3.5rem);
}

/* ---------- Titular + apoyo ---------- */
.reviews__intro {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.25rem;
}
.reviews__title {
  max-width: 14ch;
  color: var(--color-deep-blue);
}
.reviews__lede {
  max-width: 34ch;
  font-size: var(--text-body-l);
  line-height: var(--text-body-l--line-height);
  color: var(--color-text-secondary);
}

/* Nota de Google en una línea */
.reviews__score {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem 0.75rem;
  font-size: var(--text-small);
  line-height: 1.3;
}
.reviews__number {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 650;
  font-stretch: 75%;
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--color-primary);
}
.reviews__stars {
  position: relative;
  line-height: 0;
  color: var(--color-primary);
}
.reviews__stars-row {
  display: flex;
  gap: 0.15rem;
}
.reviews__stars-row svg {
  flex: none;
  width: 1.0625rem;
  height: 1.0625rem;
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
.reviews__count {
  color: var(--color-text-secondary);
}
.reviews__cta {
  margin-top: 0.5rem;
}

/* ---------- Móvil: carrusel con scroll-snap que asoma la siguiente card ---------- */
.reviews__list {
  display: flex;
  gap: 1rem;
  margin-inline: calc(var(--gutter) * -1);
  padding: 0.25rem var(--gutter) 1.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: var(--gutter);
  scrollbar-width: none;
}
.reviews__list::-webkit-scrollbar {
  display: none;
}
.reviews__list:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
  border-radius: var(--radius-l);
}
.reviews__item {
  flex: 0 0 min(84%, 22rem);
  min-width: 0;
  scroll-snap-align: start;
}

/* ---------- Tablet y escritorio: escalonado como la referencia ---------- */
@media (min-width: 768px) {
  .reviews__list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
    gap: 1.25rem 1.5rem;
    margin-inline: 0;
    padding: 0;
    overflow: visible;
    scroll-snap-type: none;
  }
  .reviews__item {
    flex: none;
  }
  /* Primera card en el centro de la columna, las otras dos apiladas a su derecha */
  .reviews__item:nth-child(1) {
    grid-row: 1 / span 2;
    align-self: center;
  }
  .reviews__item:nth-child(2) {
    grid-column: 2;
    grid-row: 1;
  }
  .reviews__item:nth-child(3) {
    grid-column: 2;
    grid-row: 2;
  }
  .reviews__item:nth-child(n + 4) {
    grid-column: auto;
    grid-row: auto;
    align-self: start;
  }
}

/* Desalineadas a propósito: la primera más abajo que el centro de las otras dos, y las otras dos con sangrías distintas */
@media (min-width: 768px) {
  .reviews__item:nth-child(1) {
    align-self: start;
    margin-top: clamp(3rem, 7vw, 6rem);
  }
  .reviews__item:nth-child(2) {
    margin-left: 2rem;
  }
  .reviews__item:nth-child(3) {
    margin-left: -1rem;
    margin-top: 0.5rem;
  }
}

@media (min-width: 1024px) {
  .reviews__layout {
    grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
    gap: clamp(2.5rem, 5vw, 5rem);
    align-items: center;
  }
  .reviews__list {
    gap: 1.5rem;
  }
}
</style>
