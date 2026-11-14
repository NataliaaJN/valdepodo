<script setup lang="ts">
/**
 * Reseñas (spec 03 §4): cabecera con la nota de la ficha de Google y una rejilla de cards.
 * **Si `reviews` está vacía, la sección no se renderiza** (solo reseñas reales con permiso).
 * Más de 6 reseñas → carrusel accesible (pendiente: no hay datos que lo justifiquen todavía).
 */
import { googleSummary, reviews } from '~/data/reviews'

const shown = computed(() => reviews.slice(0, 6))
const rating = googleSummary.rating.toLocaleString('es-ES', { minimumFractionDigits: 1 })
</script>

<template>
  <section
    v-if="shown.length"
    class="py-(--space-section)"
    data-nav-theme="bone"
    aria-labelledby="resenas-title"
  >
    <div class="container-site">
      <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p v-reveal class="eyebrow text-primary-strong">Opiniones de pacientes</p>
          <h2
            id="resenas-title"
            v-reveal
            class="mt-4 max-w-[18ch] font-display text-display-m text-deep-blue"
          >
            La confianza se construye <em class="text-primary">paso a paso</em>.
          </h2>
        </div>
        <a
          v-reveal="1"
          :href="googleSummary.url"
          target="_blank"
          rel="noopener"
          class="rating group flex items-center gap-4 self-start lg:self-auto"
        >
          <span class="font-display text-display-m leading-none text-ink">{{ rating }}</span>
          <span class="flex flex-col gap-1 text-small">
            <span class="flex gap-0.5 text-primary" aria-hidden="true">
              <svg v-for="n in 5" :key="n" viewBox="0 0 16 16" class="size-4">
                <path
                  d="m8 1.5 1.9 4 4.4.5-3.3 3 .9 4.3L8 11.1 4.1 13.3 5 9 1.7 6l4.4-.5Z"
                  fill="currentColor"
                  :fill-opacity="n === 5 ? 0.45 : 1"
                />
              </svg>
            </span>
            <span class="text-text-secondary underline underline-offset-4 group-hover:text-ink">
              {{ rating }} de 5 · {{ googleSummary.count }} opiniones en Google
              <span class="sr-only">(se abre en una pestaña nueva)</span>
            </span>
          </span>
        </a>
      </div>

      <ul class="mt-12 grid gap-5 md:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6" role="list">
        <li v-for="(review, i) in shown" :key="i" v-reveal="i" class="min-w-0">
          <ReviewCard :review="review" />
        </li>
      </ul>
    </div>
  </section>
</template>
