<script setup lang="ts">
/**
 * Reseñas (spec 03 §4): «Paso a paso». Sin tarjetas: cada reseña es un paso de un camino. Una huella marca cada
 * una (pie izquierdo, pie derecho…) y un trazado punteado las une; en escritorio los pasos bajan en escalera
 * hacia la derecha, en móvil caminan en vertical por un raíl a la izquierda.
 * - Scroll: el trazado se dibuja con el scroll y cada huella «pisa» (se rellena) cuando se llega a su paso.
 * - Sin JS o con reduced motion: camino completo y todo visible. El trazado se mide con el DOM y se recalcula
 *   al cambiar el tamaño. Cabecera estática.
 * **Si `reviews` está vacía, la sección no se renderiza** (solo reseñas reales con permiso).
 * Más de 6 reseñas → carrusel accesible (pendiente: no hay datos que lo justifiquen todavía).
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FOOT_H, FOOT_W } from '~/utils/pressure'
import { googleSummary, reviews } from '~/data/reviews'

const root = ref<HTMLElement | null>(null)
const list = ref<HTMLElement | null>(null)
const maskId = `reviews-path-${useId()}`

const shown = computed(() => reviews.slice(0, 6))
const rating = googleSummary.rating.toLocaleString('es-ES', { minimumFractionDigits: 1 })
/** Porcentaje de estrellas rellenas (4,7 de 5 → 94 %). */
const fill = `${(googleSummary.rating / 5) * 100}%`
const STAR = 'm8 1.5 1.9 4 4.4.5-3.3 3 .9 4.3L8 11.1 4.1 13.3 5 9 1.7 6l4.4-.5Z'

/** Trazado entre huellas, medido con el layout (no con transforms): vertical si caen en la misma columna, con codo si no. */
const route = reactive({ w: 0, h: 0, d: '' })

function measure() {
  const el = list.value
  if (!el) return
  const marks = Array.from(el.querySelectorAll<HTMLElement>('[data-print]')).map((p) => ({
    cx: p.offsetLeft + p.offsetWidth / 2,
    left: p.offsetLeft,
    top: p.offsetTop,
    bottom: p.offsetTop + p.offsetHeight,
    cy: p.offsetTop + p.offsetHeight / 2,
  }))
  const R = 20
  let d = ''
  for (let i = 0; i < marks.length - 1; i++) {
    const a = marks[i]!
    const b = marks[i + 1]!
    const sy = a.bottom + 8
    if (Math.abs(a.cx - b.cx) < 6) {
      d += `M${a.cx} ${sy}V${b.top - 8}`
      continue
    }
    const ex = b.left - 10
    if (ex - a.cx < R * 2) {
      d += `M${a.cx} ${sy}L${ex} ${b.cy}`
      continue
    }
    d += `M${a.cx} ${sy}V${b.cy - R}Q${a.cx} ${b.cy} ${a.cx + R} ${b.cy}H${ex}`
  }
  route.w = el.offsetWidth
  route.h = el.offsetHeight
  route.d = d
}

let resizeObserver: ResizeObserver | undefined
onMounted(() => {
  measure()
  if (list.value) {
    resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(list.value)
  }
  document.fonts?.ready.then(measure)
})
onBeforeUnmount(() => resizeObserver?.disconnect())

useGsapContext(root, (c) => {
  const steps = gsap.utils.toArray<HTMLElement>('.step', list.value as HTMLElement)
  if (c.reduce || !steps.length) return undefined
  const triggers: ScrollTrigger[] = []

  // Cada paso: el texto asoma y la huella pisa cuando el scroll llega a él
  steps.forEach((step) => {
    const text = step.querySelector('.review')
    const stamp = step.querySelector('.step__stamp')
    gsap.set(text, { autoAlpha: 0, y: 28 })
    gsap.set(stamp, { autoAlpha: 0, scale: 1.5, transformOrigin: '50% 60%' })
    triggers.push(
      ScrollTrigger.create({
        trigger: step,
        start: 'top 72%',
        once: true,
        onEnter: () => {
          gsap.to(stamp, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'expo.out' })
          gsap.to(text, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', delay: 0.12 })
        },
      }),
    )
  })

  // El trazado se dibuja con el scroll, de la primera a la última huella
  const draw = gsap.fromTo(
    '.route__reveal',
    { strokeDashoffset: 1 },
    {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: list.value,
        start: 'top 62%',
        end: 'bottom 62%',
        scrub: 0.6,
      },
    },
  )
  if (draw.scrollTrigger) triggers.push(draw.scrollTrigger)

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
    <div class="container-wide">
      <header class="reviews__head">
        <h2 id="resenas-title" class="text-display-l">Opiniones</h2>

        <a :href="googleSummary.url" target="_blank" rel="noopener" class="reviews__score">
          <span class="reviews__number" aria-hidden="true">{{ rating }}</span>
          <span class="reviews__score-side">
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
          </span>
        </a>
      </header>

      <div ref="list" class="reviews__walk">
        <!-- Camino: decorativo, detrás de las huellas -->
        <svg
          v-if="route.d"
          class="route"
          :viewBox="`0 0 ${route.w} ${route.h}`"
          :width="route.w"
          :height="route.h"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <mask :id="maskId" maskUnits="userSpaceOnUse" :width="route.w" :height="route.h">
              <path
                class="route__reveal"
                :d="route.d"
                pathLength="1"
                fill="none"
                stroke="#fff"
                stroke-width="6"
                stroke-dasharray="1"
                stroke-dashoffset="0"
              />
            </mask>
          </defs>
          <path
            :d="route.d"
            fill="none"
            stroke="var(--color-primary)"
            stroke-width="3"
            stroke-linecap="round"
            stroke-dasharray="0.1 7"
            :mask="`url(#${maskId})`"
          />
        </svg>

        <ol class="reviews__steps" role="list">
          <li v-for="(review, i) in shown" :key="i" class="step">
            <span class="step__print" data-print aria-hidden="true">
              <svg
                class="step__stamp"
                :class="i % 2 ? 'is-right' : 'is-left'"
                :viewBox="`0 0 ${FOOT_W} ${FOOT_H}`"
                focusable="false"
              >
                <Footprint :side="i % 2 ? 'right' : 'left'" variant="both" :stroke-width="5" />
              </svg>
            </span>
            <ReviewCard :review="review" />
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.reviews {
  padding-block: clamp(3.5rem, 7vw, 6.5rem);
  /* Cian muy claro: el mismo de la pausa de datos, para que no se funda con el pre-footer azul */
  background: linear-gradient(180deg, #e6f6fc 0%, #d9f0fa 100%);
  color: var(--color-ink);
}
.reviews h2 {
  color: var(--color-deep-blue);
}

/* ---------- Cabecera ---------- */
.reviews__head {
  display: grid;
  gap: 1.5rem;
  align-items: end;
}
.reviews__score {
  display: inline-flex;
  align-items: center;
  gap: 0.875rem;
  justify-self: start;
  color: var(--color-ink);
}
.reviews__number {
  font-family: var(--font-display);
  font-size: clamp(3rem, 2.4rem + 2.4vw, 4.5rem);
  font-weight: 650;
  font-stretch: 75%;
  line-height: 0.85;
  letter-spacing: -0.03em;
  color: var(--color-primary);
}
.reviews__score-side {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: var(--text-small);
  line-height: 1.3;
}
.reviews__stars {
  position: relative;
  align-self: flex-start;
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
  text-decoration: underline;
  text-decoration-color: rgb(6 26 44 / 0.35);
  text-underline-offset: 4px;
  transition: text-decoration-color var(--dur-fast) var(--ease-out-soft);
}
.reviews__score:hover .reviews__count {
  text-decoration-color: currentColor;
}

/* ---------- Camino de pasos (móvil: un raíl vertical a la izquierda) ---------- */
.reviews__walk {
  position: relative;
  margin-top: clamp(2.5rem, 5vw, 4.5rem);
}
.reviews__steps {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  row-gap: clamp(2.5rem, 7vw, 4rem);
}
.route {
  position: absolute;
  top: 0;
  left: 0;
  max-width: none;
  pointer-events: none;
}
/* `.step` no es posicionado: así `offsetLeft/offsetTop` de la huella se miden contra la lista */
.step {
  display: grid;
  grid-template-columns: 2.25rem minmax(0, 1fr);
  column-gap: clamp(1rem, 2vw, 1.5rem);
  align-items: start;
}
.step__print {
  display: block;
  width: 2.25rem;
  height: 3.75rem;
}
.step__stamp {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  --fp-fill: var(--color-primary);
  --fp-stroke: var(--color-primary);
}
.step__stamp.is-left {
  transform: rotate(-9deg);
}
.step__stamp.is-right {
  transform: rotate(9deg);
}

/* ---------- Escritorio: los pasos bajan en escalera hacia la derecha ---------- */
@media (min-width: 768px) {
  .reviews__head {
    grid-template-columns: minmax(0, 1fr) auto;
  }
  .reviews__score {
    justify-self: end;
    padding-bottom: 0.5rem;
  }
}
@media (min-width: 1024px) {
  .reviews__steps {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: clamp(1rem, 2vw, 1.5rem);
    row-gap: clamp(2.5rem, 4vw, 3.5rem);
  }
  .step {
    column-gap: clamp(1.25rem, 2vw, 2rem);
  }
  .step:nth-of-type(3n + 1) {
    grid-column: 1 / 7;
  }
  .step:nth-of-type(3n + 2) {
    grid-column: 4 / 10;
  }
  .step:nth-of-type(3n) {
    grid-column: 7 / 13;
  }
}
</style>
