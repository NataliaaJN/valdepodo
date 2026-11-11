<script setup lang="ts">
/**
 * Página de error con la identidad de marca (spec 02 §6): 404 con una huella "perdida" que se sale del
 * camino. Otros errores: mensaje genérico, sin detalles técnicos.
 */
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error.statusCode === 404)

useSeoMeta({
  title: () => (is404.value ? 'Página no encontrada' : 'Algo ha fallado'),
  robots: 'noindex, nofollow',
})

const trail = [
  { x: 40, y: 230, r: 8, side: 'left' },
  { x: 92, y: 180, r: 14, side: 'right' },
  { x: 132, y: 128, r: 32, side: 'left' },
  { x: 196, y: 96, r: 70, side: 'right' },
  { x: 250, y: 120, r: 128, side: 'left' },
] as const
</script>

<template>
  <NuxtLayout>
    <section class="section-clip relative isolate py-(--space-section)" aria-labelledby="error-title">
      <div class="container-wide grid items-center gap-12 lg:grid-cols-12">
        <div class="lg:col-span-6">
          <p class="eyebrow text-primary-strong">Error {{ error.statusCode }}</p>
          <h1 id="error-title" class="mt-4 text-display-l text-ink">
            <template v-if="is404">Este camino no lleva a ninguna parte.</template>
            <template v-else>Algo ha fallado en este paso.</template>
          </h1>
          <p class="mt-6 max-w-[44ch] text-body-l text-text-secondary">
            <template v-if="is404">La página que buscas no existe o ha cambiado de dirección.</template>
            <template v-else>Inténtalo de nuevo en unos minutos o vuelve al inicio.</template>
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <BaseButton to="/" arrow @click="clearError()">Volver al inicio</BaseButton>
            <BaseButton to="/contacto#cita" variant="secondary" @click="clearError()">Pedir cita</BaseButton>
          </div>
        </div>
        <svg
          viewBox="0 0 320 300"
          class="mx-auto w-full max-w-[26rem] overflow-visible lg:col-span-5 lg:col-start-8"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M20 290 C 80 240, 120 170, 180 120"
            fill="none"
            stroke="var(--color-primary)"
            stroke-width="1.5"
            stroke-dasharray="2 6"
            stroke-linecap="round"
          />
          <g
            v-for="(s, i) in trail"
            :key="i"
            class="lost-step"
            :style="{ '--i': i }"
            :transform="`translate(${s.x} ${s.y}) rotate(${s.r}) scale(0.22)`"
          >
            <Footprint :side="s.side" :variant="i === trail.length - 1 ? 'outline' : 'fill'" />
          </g>
        </svg>
      </div>
    </section>
  </NuxtLayout>
</template>

<style scoped>
.lost-step {
  --fp-fill: var(--color-primary);
  animation: step-in 600ms var(--ease-out-soft) both;
  animation-delay: calc(var(--i) * 140ms + 200ms);
}
.lost-step:last-of-type {
  --fp-stroke: var(--color-primary);
}
@keyframes step-in {
  from {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .lost-step {
    animation: none;
  }
}
</style>
