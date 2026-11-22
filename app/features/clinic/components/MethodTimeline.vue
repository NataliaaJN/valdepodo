<script setup lang="ts">
/**
 * Cómo trabajamos: las cinco fases de la clínica como una línea de pasos conectados sobre tinta.
 * - ≥ 1024 px: línea horizontal con los pasos repartidos de lado a lado.
 * - < 1024 px: la misma línea en vertical, a la izquierda.
 * El scroll rellena la línea (ScrollTrigger, sin fijar nada) y va «encendiendo» cada paso al alcanzarlo.
 * Sin JS o con reduced motion: línea completa y todos los pasos visibles.
 */
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { clinic } from '~/features/clinic/data/clinic'

const root = ref<HTMLElement | null>(null)
const list = ref<HTMLElement | null>(null)
const steps = clinic.method
// SSR y sin movimiento: todo encendido. El cliente lo recalcula con el scroll.
const active = ref(steps.length)

useGsapContext(root, (c) => {
  const el = list.value
  if (c.reduce || !el) return undefined
  // Cada paso es un <li> posicionado respecto a la lista: su arranque es donde la línea toca su nodo
  const items = [...el.children] as HTMLElement[]
  const horizontal = c.desktop

  const update = (progress: number) => {
    const length = horizontal ? el.offsetWidth : el.offsetHeight
    const reached = progress * length + 1
    el.style.setProperty('--p', progress.toFixed(4))
    active.value = items.filter((li) => (horizontal ? li.offsetLeft : li.offsetTop) <= reached).length
  }

  update(0)
  const trigger = ScrollTrigger.create({
    trigger: el,
    start: horizontal ? 'top 88%' : 'top 70%',
    end: horizontal ? 'top 38%' : 'bottom 58%',
    onUpdate: (self) => update(self.progress),
    onRefresh: (self) => update(self.progress),
  })

  return () => {
    trigger.kill()
    el.style.removeProperty('--p')
    active.value = steps.length
  }
})
</script>

<template>
  <section
    ref="root"
    class="method chapter-ink section-clip py-[clamp(4rem,8vw,7.5rem)]"
    data-nav-theme="ink"
    aria-labelledby="method-title"
  >
    <div class="container-wide">
      <div class="method__head">
        <h2 id="method-title" v-reveal class="method__title text-display-m">
          Método de trabajo en cinco pasos
        </h2>
      </div>

      <ol ref="list" class="timeline" role="list">
        <li v-for="(step, i) in steps" :key="step.title" class="step" :class="{ 'is-on': i < active }">
          <span class="step__node" data-node aria-hidden="true" />
          <h3 class="step__title">{{ step.title }}</h3>
          <ContentValue :value="step.text" as="p" class="step__text" />
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.method__title {
  max-width: 16ch;
}

/* ---------- Móvil y tablet: línea vertical a la izquierda ---------- */
.timeline {
  --p: 1;
  --node: 0.875rem;
  position: relative;
  display: grid;
  gap: 2.25rem;
  margin-top: clamp(2.5rem, 6vw, 4rem);
  padding-left: 2.25rem;
}
.timeline::before,
.timeline::after {
  content: '';
  position: absolute;
  left: calc(var(--node) / 2 - 0.5px);
  top: calc(var(--node) / 2);
  bottom: 0;
  width: 1px;
}
.timeline::before {
  background: var(--color-border);
}
.timeline::after {
  background: var(--color-cyan);
  transform: scaleY(var(--p));
  transform-origin: top;
}

.step {
  position: relative;
  opacity: 0.46;
  transform: translateY(6px);
  transition:
    opacity 600ms var(--ease-out-soft),
    transform 600ms var(--ease-out-soft);
}
.step.is-on {
  opacity: 1;
  transform: none;
}
.step__node {
  position: absolute;
  top: 0.45em;
  left: -2.25rem;
  width: var(--node);
  height: var(--node);
  border: 1px solid rgb(241 239 233 / 0.55);
  border-radius: var(--radius-pill);
  background: var(--color-ink);
  transition:
    background-color 450ms var(--ease-out-soft),
    border-color 450ms var(--ease-out-soft),
    outline-color 450ms var(--ease-out-soft);
  outline: 5px solid transparent;
}
.step.is-on .step__node {
  background: var(--color-cyan);
  border-color: var(--color-cyan);
  outline-color: rgb(30 171 225 / 0.22);
}
.step__title {
  font-size: var(--text-heading-s);
  line-height: 1.1;
  color: var(--color-bone);
}
.step__text {
  margin-top: 0.5rem;
  max-width: 34ch;
  color: var(--color-text-secondary);
}

/* ---------- Escritorio: línea horizontal ---------- */
@media (min-width: 1024px) {
  .timeline {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0 2rem;
    padding-left: 0;
    padding-top: 2.75rem;
  }
  .timeline::before,
  .timeline::after {
    left: 0;
    right: 0;
    top: calc(var(--node) / 2 - 0.5px);
    bottom: auto;
    width: auto;
    height: 1px;
  }
  .timeline::after {
    transform: scaleX(var(--p));
    transform-origin: left;
  }
  .step__node {
    top: -2.75rem;
    left: 0;
  }
  .step__title {
    font-size: clamp(1.5rem, 0.9rem + 1.1vw, 2rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .step,
  .step__node {
    transition: none;
  }
}
</style>
