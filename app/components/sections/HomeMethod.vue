<script setup lang="ts">
/**
 * Manifiesto + método. Capítulo de hueso, casi solo tipografía:
 * «Todo empieza por tus pies.» se «lee» con el scroll (las palabras pasan de 22 % a 100 % de opacidad) mientras
 * queda fijo a la izquierda, y a la derecha pasan los cuatro verbos de la filosofía de la clínica.
 * Reduced motion: todo visible desde el principio.
 */
import { gsap } from 'gsap'
import { hero } from '~/data/home'

const root = ref<HTMLElement | null>(null)
const statement = `${hero.title.before}${hero.title.accent}${hero.title.after}`
const words = statement.split(' ')

useGsapContext(root, (c) => {
  if (c.reduce || !root.value) return undefined
  const targets = root.value.querySelectorAll('[data-word]')
  gsap.fromTo(
    targets,
    { opacity: 0.2 },
    {
      opacity: 1,
      ease: 'none',
      stagger: 0.5,
      scrollTrigger: {
        trigger: root.value.querySelector('[data-statement]'),
        start: 'top 78%',
        end: 'bottom 38%',
        scrub: 0.4,
      },
    },
  )
  return undefined
})
</script>

<template>
  <section
    ref="root"
    class="chapter-bone relative py-(--space-section)"
    data-nav-theme="bone"
    aria-labelledby="metodo-title"
  >
    <div class="container-wide grid gap-16 lg:grid-cols-12">
      <div class="lg:col-span-6">
        <div class="lg:sticky lg:top-[calc(var(--nav-h-compact)+3rem)]" data-statement>
          <p v-reveal class="eyebrow text-primary-strong">Método</p>
          <h2 id="metodo-title" class="mt-6 text-display-xl text-ink" :aria-label="statement">
            <span v-for="(word, i) in words" :key="i" data-word aria-hidden="true">{{ word }}{{ ' ' }}</span>
          </h2>
        </div>
      </div>

      <PhilosophyList class="lg:col-span-6 lg:pt-[18vh]" />
    </div>
  </section>
</template>
