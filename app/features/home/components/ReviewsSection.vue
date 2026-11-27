<script setup lang="ts">
/**
 * Reseñas (spec 03 §4). El titular centrado en vertical a la izquierda (frase de apoyo, nota de Google y botón a
 * la ficha) y a la derecha un carrusel con scroll-snap con todas las reseñas de `data/reviews.ts`.
 * - ≥ 768 px: se ven dos a la vez. < 768 px: una asoma con la siguiente. Se desliza con el dedo; flechas
 *   anterior/siguiente en todos los tamaños (teclado con Tab entre los enlaces).
 * - Scroll: las cards aparecen una tras otra solo con fundido (ScrollTrigger.batch), ya en su posición final. El
 *   titular no se anima. Reduced motion: todo visible.
 * **Si `reviews` está vacía, la sección no se renderiza** (solo reseñas reales con permiso).
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { googleSummary, reviews } from '~/features/home/data/reviews'

const root = ref<HTMLElement | null>(null)
const list = ref<HTMLElement | null>(null)

const shown = computed(() => reviews)
const rating = googleSummary.rating.toLocaleString('es-ES', { minimumFractionDigits: 1 })
/** Porcentaje de estrellas rellenas (4,7 de 5 → 94 %). */
const fill = `${(googleSummary.rating / 5) * 100}%`
const canPrev = ref(false)
const canNext = ref(false)
const updateNav = () => {
  const el = list.value
  if (!el) return
  canPrev.value = el.scrollLeft > 4
  canNext.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}
const go = (dir: 1 | -1) => {
  const el = list.value
  const item = el?.firstElementChild as HTMLElement | null
  if (!el || !item) return
  const gap = parseFloat(getComputedStyle(el).columnGap) || 0
  el.scrollBy({ left: dir * (item.offsetWidth + gap), behavior: 'smooth' })
}
onMounted(() => {
  updateNav()
  window.addEventListener('resize', updateNav, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('resize', updateNav))

const STAR = 'm8 1.5 1.9 4 4.4.5-3.3 3 .9 4.3L8 11.1 4.1 13.3 5 9 1.7 6l4.4-.5Z'

useGsapContext(root, (c) => {
  const cards = list.value ? gsap.utils.toArray<HTMLElement>(list.value.children) : []
  if (c.reduce || !cards.length) return undefined

  gsap.set(cards, { autoAlpha: 0 })
  const triggers = ScrollTrigger.batch(cards, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { autoAlpha: 1, duration: 0.6, ease: 'power1.out', stagger: 0.12, overwrite: true }),
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

      <div class="reviews__carousel">
        <ul
          ref="list"
          class="reviews__list"
          role="list"
          aria-label="Opiniones de pacientes"
          @scroll.passive="updateNav"
        >
          <li v-for="(review, i) in shown" :key="i" class="reviews__item">
            <ReviewCard :review="review" />
          </li>
        </ul>
        <div v-if="shown.length > 1" class="reviews__nav">
          <button
            type="button"
            class="reviews__arrow"
            aria-label="Opiniones anteriores"
            :disabled="!canPrev"
            @click="go(-1)"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M19 12H5m6-6-6 6 6 6"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="square"
              />
            </svg>
          </button>
          <button
            type="button"
            class="reviews__arrow"
            aria-label="Opiniones siguientes"
            :disabled="!canNext"
            @click="go(1)"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12h14m-6-6 6 6-6 6"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="square"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.reviews {
  padding-block: clamp(3.5rem, 8vw, 7rem);
  /* Hueso base: la banda de datos (cyan muy claro) y el pre-footer (cyan claro) quedan como capítulos distintos */
  background: var(--color-bone);
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
  color: var(--color-primary-strong);
}
.reviews__stars {
  position: relative;
  line-height: 0;
  color: var(--color-coral);
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

/* ---------- Carrusel: scroll-snap en todos los tamaños; en móvil asoma la siguiente card ---------- */
.reviews__carousel {
  min-width: 0;
}
.reviews__list {
  display: flex;
  gap: 1rem;
  margin-inline: calc(var(--gutter) * -1);
  padding: 0.25rem var(--gutter) 1rem;
  overflow-x: auto;
  /* `overflow-x: auto` fuerza `auto` también en vertical: sin esto, cualquier desborde crearía un scroll
     interno que se come la rueda/el dedo. */
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: var(--gutter);
  scrollbar-width: none;
}
.reviews__list::-webkit-scrollbar {
  display: none;
}
.reviews__item {
  flex: 0 0 min(84%, 22rem);
  min-width: 0;
  scroll-snap-align: start;
}
.reviews__nav {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.reviews__arrow {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  border: 1px solid var(--color-deep-blue);
  color: var(--color-deep-blue);
  transition:
    background-color var(--dur-base) var(--ease-out-soft),
    color var(--dur-base) var(--ease-out-soft),
    opacity var(--dur-base) var(--ease-out-soft);
}
.reviews__arrow svg {
  width: 1.25rem;
  height: 1.25rem;
}
.reviews__arrow:disabled {
  opacity: 0.3;
  cursor: default;
}
.reviews__arrow:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
@media (hover: hover) and (pointer: fine) {
  .reviews__arrow:not(:disabled):hover {
    background: var(--color-deep-blue);
    color: var(--color-bone);
  }
}

/* ---------- Tablet y escritorio: dos cards a la vez ---------- */
@media (min-width: 768px) {
  .reviews__list {
    gap: 1.5rem;
    margin-inline: 0;
    padding-inline: 0;
    scroll-padding-inline: 0;
  }
  .reviews__item {
    flex: 0 0 calc((100% - 1.5rem) / 2);
  }
}

@media (min-width: 1024px) {
  .reviews__layout {
    grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
    gap: clamp(2.5rem, 5vw, 5rem);
    align-items: center;
  }
}
</style>
