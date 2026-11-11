<script setup lang="ts">
/**
 * Reseñas (spec 03 §4). Composición editorial: una destacada grande + hasta 4 secundarias en columna.
 * **Si `reviews` está vacía, la sección no se renderiza** (solo reseñas reales con permiso).
 * Más de 5 reseñas → carrusel accesible (pendiente: no hay datos que lo justifiquen todavía).
 */
import { reviews } from '~/data/reviews'

const featured = computed(() => reviews[0])
const secondary = computed(() => reviews.slice(1, 5))
</script>

<template>
  <section v-if="featured" class="py-(--space-section)" aria-labelledby="resenas-title">
    <div class="container-site">
      <h2 id="resenas-title" v-reveal class="max-w-[18ch] font-display text-display-m text-deep-blue">
        La confianza se construye <em>paso a paso</em>.
      </h2>
      <div class="mt-12 grid gap-12 lg:grid-cols-12">
        <figure v-reveal class="lg:col-span-7">
          <blockquote class="font-display text-display-m text-deep-blue">
            <p>“{{ featured.text }}”</p>
          </blockquote>
          <ReviewMeta :review="featured" class="mt-6" />
        </figure>
        <ul v-if="secondary.length" class="grid content-start gap-8 lg:col-span-4 lg:col-start-9" role="list">
          <li v-for="(review, i) in secondary" :key="i" v-reveal="i" class="border-t border-border pt-6">
            <figure>
              <blockquote>
                <p class="text-body-l text-text">“{{ review.text }}”</p>
              </blockquote>
              <ReviewMeta :review="review" class="mt-4" />
            </figure>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
