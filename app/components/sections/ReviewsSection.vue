<script setup lang="ts">
/**
 * Reseñas (spec 03 §4): pieza editorial sobre cian muy claro, distinta del pre-footer azul que viene después.
 * - Un campo gráfico ambiental detrás: líneas de presión plantar (isobaras de antepié y talón) y dos halos
 *   de luz que derivan muy despacio. Es decorativo (`aria-hidden`).
 * - Título y frase arriba; la nota de Google (cifra grande) a la izquierda; la reseña protagonista a escala de
 *   titular; las demás como hojas de apoyo desplazadas y solapadas.
 * - Scroll: las piezas entran una tras otra (ScrollTrigger.batch) y el campo gráfico se desplaza con paralaje.
 *   El título no se anima. Con reduced motion o sin JS todo es visible y estático.
 * **Si `reviews` está vacía, la sección no se renderiza** (solo reseñas reales con permiso).
 * Más de 6 reseñas → carrusel accesible (pendiente: no hay datos que lo justifiquen todavía).
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { googleSummary, reviews } from '~/data/reviews'

const root = ref<HTMLElement | null>(null)
const field = ref<HTMLElement | null>(null)

const shown = computed(() => reviews.slice(0, 6))
const featured = computed(() => shown.value.find((r) => r.featured) ?? shown.value[0])
const notes = computed(() => shown.value.filter((r) => r !== featured.value))

const rating = googleSummary.rating.toLocaleString('es-ES', { minimumFractionDigits: 1 })
/** Porcentaje de estrellas rellenas (4,7 de 5 → 94 %). */
const fill = `${(googleSummary.rating / 5) * 100}%`
const STAR = 'm8 1.5 1.9 4 4.4.5-3.3 3 .9 4.3L8 11.1 4.1 13.3 5 9 1.7 6l4.4-.5Z'

/** Isobaras de presión plantar: anillos concéntricos de antepié y talón (viewBox 600 × 900). */
const clusters = [
  { cx: 340, cy: 250, rotate: -14, ratio: 0.62, from: 46, step: 34, rings: 6 },
  { cx: 448, cy: 78, rotate: -20, ratio: 0.8, from: 16, step: 14, rings: 3 },
  { cx: 262, cy: 690, rotate: 8, ratio: 0.86, from: 40, step: 32, rings: 5 },
]
const rings = clusters.flatMap((c) =>
  Array.from({ length: c.rings }, (_, i) => ({
    cx: c.cx,
    cy: c.cy,
    rx: c.from + i * c.step,
    ry: (c.from + i * c.step) * c.ratio,
    rotate: c.rotate,
    opacity: Math.max(0.1, 0.5 - i * 0.07),
  })),
)

useGsapContext(root, (c) => {
  if (c.reduce) return undefined
  const pieces = gsap.utils.toArray<HTMLElement>('[data-enter]', root.value as HTMLElement)
  const triggers: ScrollTrigger[] = []

  // Entrada: una tras otra, en orden de lectura; las que ya están a la vista se escalonan juntas
  gsap.set(pieces, { autoAlpha: 0, y: 48 })
  triggers.push(
    ...ScrollTrigger.batch(pieces, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: 1.2,
          ease: 'expo.out',
          stagger: 0.16,
          overwrite: true,
        }),
    }),
  )

  // Paralaje del campo gráfico: se mueve menos que el contenido, así parece estar detrás
  if (field.value) {
    const tween = gsap.fromTo(
      field.value,
      { yPercent: 6 },
      {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: { trigger: root.value, start: 'top bottom', end: 'bottom top', scrub: 1 },
      },
    )
    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger)
  }
  return () => triggers.forEach((t) => t.kill())
})
</script>

<template>
  <section
    v-if="featured"
    ref="root"
    class="reviews section-clip"
    data-nav-theme="bone"
    aria-labelledby="resenas-title"
  >
    <!-- Campo gráfico ambiental -->
    <div class="reviews__backdrop" aria-hidden="true">
      <span class="reviews__halo reviews__halo--a" />
      <span class="reviews__halo reviews__halo--b" />
      <div ref="field" class="reviews__field">
        <svg viewBox="0 0 600 900" fill="none" focusable="false">
          <g stroke="var(--color-primary)" stroke-width="1">
            <ellipse
              v-for="(r, i) in rings"
              :key="i"
              :cx="r.cx"
              :cy="r.cy"
              :rx="r.rx"
              :ry="r.ry"
              :transform="`rotate(${r.rotate} ${r.cx} ${r.cy})`"
              :stroke-opacity="r.opacity"
            />
          </g>
          <g fill="var(--color-cyan)" fill-opacity="0.4">
            <circle cx="340" cy="250" r="5" />
            <circle cx="448" cy="78" r="3" />
            <circle cx="262" cy="690" r="5" />
          </g>
        </svg>
      </div>
    </div>

    <div class="container-wide reviews__layout">
      <h2 id="resenas-title" class="reviews__title text-display-l">Opiniones</h2>

      <a
        data-enter
        :href="googleSummary.url"
        target="_blank"
        rel="noopener"
        class="reviews__score"
      >
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
          <span class="sr-only">(se abre en una pestaña nueva)</span>
        </span>
      </a>

      <p data-enter class="reviews__lede">
        La confianza de nuestros pacientes también forma parte del tratamiento.
      </p>

      <div data-enter class="reviews__featured">
        <ReviewCard :review="featured!" variant="featured" />
      </div>

      <ul v-if="notes.length" class="reviews__notes" role="list">
        <li v-for="(review, i) in notes" :key="i" data-enter class="reviews__note">
          <ReviewCard :review="review" variant="note" />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.reviews {
  position: relative;
  isolation: isolate;
  padding-block: clamp(4rem, 8vw, 8rem);
  background: linear-gradient(180deg, #e6f6fc 0%, #d9f0fa 100%);
  color: var(--color-ink);
}

/* ---------- Campo gráfico ---------- */
.reviews__backdrop {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}
.reviews__field {
  position: absolute;
  top: -4%;
  right: -22%;
  width: min(86vw, 40rem);
  opacity: 0.85;
  will-change: transform;
}
.reviews__field svg {
  display: block;
  width: 100%;
  height: auto;
}
.reviews__halo {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(closest-side, rgb(30 171 225 / 0.22), rgb(30 171 225 / 0));
  animation: reviews-drift 26s ease-in-out infinite alternate;
}
.reviews__halo--a {
  top: 6%;
  left: -12%;
  width: 34rem;
  aspect-ratio: 1;
}
.reviews__halo--b {
  right: 8%;
  bottom: -14%;
  width: 30rem;
  aspect-ratio: 1;
  background: radial-gradient(closest-side, rgb(18 112 182 / 0.14), rgb(18 112 182 / 0));
  animation-duration: 32s;
  animation-direction: alternate-reverse;
}
@keyframes reviews-drift {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(4%, -6%, 0) scale(1.08);
  }
}
@media (prefers-reduced-motion: reduce) {
  .reviews__halo {
    animation: none;
  }
}

/* ---------- Composición (móvil: una columna con jerarquía fija) ---------- */
.reviews__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  row-gap: clamp(1.5rem, 4vw, 2.5rem);
}
.reviews__title {
  color: var(--color-deep-blue);
}

/* Nota de Google: la cifra es protagonista, el resto la acompaña */
.reviews__score {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas:
    'num stars'
    'num count';
  align-items: center;
  column-gap: 1rem;
  row-gap: 0.4rem;
  justify-self: start;
  color: var(--color-ink);
}
.reviews__number {
  grid-area: num;
  font-family: var(--font-display);
  font-size: clamp(5rem, 3rem + 7vw, 9.5rem);
  font-weight: 650;
  font-stretch: 75%;
  line-height: 0.8;
  letter-spacing: -0.04em;
  color: var(--color-primary);
}
.reviews__stars {
  grid-area: stars;
  position: relative;
  align-self: end;
  line-height: 0;
  color: var(--color-primary);
}
.reviews__stars-row {
  display: flex;
  gap: 0.2rem;
}
.reviews__stars-row svg {
  flex: none;
  width: 1.25rem;
  height: 1.25rem;
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
  grid-area: count;
  align-self: start;
  font-size: var(--text-small);
  line-height: 1.3;
  text-decoration: underline;
  text-decoration-color: rgb(6 26 44 / 0.35);
  text-underline-offset: 4px;
  transition: text-decoration-color var(--dur-fast) var(--ease-out-soft);
}
.reviews__score:hover .reviews__count {
  text-decoration-color: currentColor;
}

.reviews__lede {
  margin-top: 0.5rem;
  max-width: 28ch;
  font-size: var(--text-body-l);
  line-height: var(--text-body-l--line-height);
  color: var(--color-text-secondary);
}

/* Notas: en móvil se alternan con una sangría para no ser una pila de cajas iguales */
.reviews__notes {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}
.reviews__note {
  min-width: 0;
}
.reviews__note:nth-child(odd) {
  margin-right: clamp(0.5rem, 6vw, 2.5rem);
}
.reviews__note:nth-child(even) {
  margin-left: clamp(0.5rem, 6vw, 2.5rem);
}

/* ---------- Tablet ---------- */
@media (min-width: 768px) {
  .reviews__layout {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: clamp(1rem, 2vw, 1.5rem);
  }
  .reviews__title {
    grid-column: 1 / 8;
  }
  .reviews__lede {
    grid-column: 8 / 13;
    align-self: end;
    justify-self: end;
  }
  .reviews__score {
    grid-column: 1 / 13;
  }
  .reviews__featured {
    grid-column: 3 / 13;
  }
  .reviews__notes {
    grid-column: 1 / 13;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: clamp(1rem, 2vw, 1.5rem);
    row-gap: 1.5rem;
  }
  .reviews__note:nth-child(odd) {
    grid-column: 1 / 7;
    margin: 0;
  }
  .reviews__note:nth-child(even) {
    grid-column: 7 / 13;
    margin: 3rem 0 0;
  }
}

/* ---------- Escritorio: cifra a la izquierda, protagonista a la derecha, notas solapadas debajo ---------- */
@media (min-width: 1024px) {
  .reviews__score {
    grid-column: 1 / 5;
    grid-row: 2;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'num'
      'stars'
      'count';
    justify-items: start;
    row-gap: 0.75rem;
    align-self: start;
    padding-top: 0.5rem;
  }
  .reviews__stars-row svg {
    width: 1.5rem;
    height: 1.5rem;
  }
  .reviews__featured {
    grid-column: 5 / 13;
    grid-row: 2;
  }
  .reviews__title {
    grid-column: 1 / 7;
    grid-row: 1;
  }
  .reviews__lede {
    grid-column: 8 / 13;
    grid-row: 1;
  }
  .reviews__notes {
    grid-row: 3;
    margin-top: 0;
  }
  .reviews__note:nth-child(odd) {
    grid-column: 2 / 7;
  }
  .reviews__note:nth-child(even) {
    grid-column: 8 / 13;
    margin-top: 4rem;
  }
  .reviews__field {
    right: -4%;
    width: min(46vw, 44rem);
  }
}
</style>
