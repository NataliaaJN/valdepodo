<script setup lang="ts">
/**
 * Filosofía (spec 05 §5): "Escuchar. Analizar. Tratar. Prevenir." Cuatro conceptos unidos por una línea de
 * recorrido que se dibuja con el scroll; al alcanzar cada concepto, este se activa (punto cian, título en
 * primary, texto visible).
 * - Escritorio: recorrido horizontal ondulado, conceptos alternando arriba/abajo.
 * - Tablet: 2×2. Móvil: vertical con la línea a la izquierda.
 * - Reduced motion (o sin JS): línea completa y todos los conceptos activos.
 */
import { gsap } from 'gsap'
import type { ScrollTrigger } from 'gsap/ScrollTrigger'
import { clinic } from '~/data/clinic'

const root = ref<HTMLElement | null>(null)
const active = ref(clinic.philosophy.length)

useGsapContext(root, (c) => {
  if (c.reduce || !root.value) return undefined
  const line = root.value.querySelector('[data-flow]')
  const bar = root.value.querySelector('[data-flow-bar]')
  active.value = 0
  // pathLength="1": la línea se dibuja de 0 a 1 sea cual sea su longitud real
  gsap.set(line, { strokeDasharray: 1, strokeDashoffset: 1 })
  gsap.set(bar, { scaleY: 0 })
  const st = {
    trigger: root.value,
    start: 'top 70%',
    end: 'bottom 60%',
    scrub: 0.5,
    onUpdate: (self: ScrollTrigger) => {
      const n = clinic.philosophy.length
      active.value = Math.min(n, Math.floor(self.progress * n + 0.25))
    },
  }
  const tl = gsap.timeline({ scrollTrigger: st })
  tl.to(line, { strokeDashoffset: 0, ease: 'none' }, 0).to(bar, { scaleY: 1, ease: 'none' }, 0)
  return () => {
    active.value = clinic.philosophy.length
  }
})
</script>

<template>
  <section ref="root" class="philosophy section-clip py-(--space-section)" aria-labelledby="philo-title">
    <div class="container-site">
      <h2 id="philo-title" v-reveal class="max-w-[16ch] font-display text-display-m text-deep-blue">
        Escuchar. Analizar. Tratar. <em class="text-primary">Prevenir</em>.
      </h2>

      <div class="flow mt-14">
        <!-- Escritorio: onda horizontal -->
        <svg class="flow-wave" viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden="true">
          <path class="flow-base" d="M0 100 C 150 0, 300 0, 450 100 S 750 200, 900 100 S 1100 20, 1200 60" />
          <path
            data-flow
            pathLength="1"
            class="flow-line"
            d="M0 100 C 150 0, 300 0, 450 100 S 750 200, 900 100 S 1100 20, 1200 60"
          />
        </svg>
        <!-- Móvil y tablet: línea vertical -->
        <div class="flow-vertical" aria-hidden="true"><span data-flow-bar class="flow-bar" /></div>

        <ol class="concepts">
          <li
            v-for="(concept, i) in clinic.philosophy"
            :key="concept.title"
            class="concept"
            :class="{ 'is-active': i < active }"
          >
            <span class="concept-dot" aria-hidden="true" />
            <span class="font-display text-heading-s text-text-secondary">0{{ i + 1 }}</span>
            <h3 class="concept-title mt-1 text-heading-s font-semibold">{{ concept.title }}</h3>
            <ContentValue
              :value="concept.text"
              as="p"
              class="concept-text mt-2 max-w-[28ch] text-text-secondary"
            />
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.flow {
  position: relative;
}
.flow-base,
.flow-line {
  fill: none;
  stroke-linecap: round;
}
.flow-base {
  stroke: var(--color-border);
  stroke-width: 1.5;
}
.flow-line {
  stroke: var(--color-primary);
  stroke-width: 2;
}
.flow-bar {
  position: absolute;
  inset: 0;
  background: linear-gradient(var(--color-primary), var(--color-cyan));
  transform-origin: top;
}
.flow-wave {
  display: none;
}
.flow-vertical {
  position: absolute;
  left: 6px;
  top: 0.5rem;
  bottom: 0.5rem;
  width: 1.5px;
  background: var(--color-border);
}
.concepts {
  display: grid;
  gap: 2.5rem;
  padding-left: 2.5rem;
}
.concept {
  position: relative;
}
.concept-dot {
  position: absolute;
  left: calc(-2.5rem + 1px);
  top: 0.4rem;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: 1.5px solid var(--color-border-strong);
  background: var(--color-surface);
  transition:
    background-color var(--dur-base) var(--ease-out-soft),
    border-color var(--dur-base) var(--ease-out-soft),
    box-shadow var(--dur-base) var(--ease-out-soft);
}
.concept-title {
  color: var(--color-deep-blue);
  transition: color var(--dur-base) var(--ease-out-soft);
}
/* Sin bajar la opacidad: el texto inactivo tiene que seguir siendo legible (contraste AA) */
.concept-text {
  transform: translateY(6px);
  transition:
    transform var(--dur-base) var(--ease-out-soft),
    color var(--dur-base) var(--ease-out-soft);
}
.is-active .concept-dot {
  border-color: var(--color-cyan);
  background: var(--color-cyan);
  box-shadow: 0 0 0 5px rgb(30 171 225 / 0.18);
}
.is-active .concept-title {
  color: var(--color-primary);
}
.is-active .concept-text {
  transform: none;
  color: var(--color-text);
}

@media (min-width: 768px) and (max-width: 1023px) {
  .concepts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 3rem 2.5rem;
  }
}

@media (min-width: 1024px) {
  .flow {
    padding-block: 6rem;
  }
  .flow-vertical {
    display: none;
  }
  .flow-wave {
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    width: 100%;
    height: 200px;
    transform: translateY(-50%);
  }
  .concepts {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 2rem;
    padding-left: 0;
  }
  /* La onda pasa por detrás de cada concepto: el fondo evita que cruce el texto */
  .concept {
    padding: 1rem 1rem 1rem 2rem;
    border-radius: var(--radius-m);
    background: var(--color-surface);
  }
  .concept:nth-child(odd) {
    transform: translateY(-5.5rem);
  }
  .concept:nth-child(even) {
    transform: translateY(5.5rem);
  }
  .concept-dot {
    left: 0.75rem;
    top: 1.4rem;
  }
}
</style>
