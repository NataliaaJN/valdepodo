<script setup lang="ts">
/**
 * Experiencia (spec 05 §4): numeral gigante con los años (desde `site.foundedYear`), en contorno y con un
 * relleno que sube con el scroll (solo escritorio y sin reduced motion; si no, relleno completo), sobre el
 * azul Valdepodo. Línea temporal solo con hitos reales.
 */
import { gsap } from 'gsap'
import { clinic } from '~/data/clinic'
import { site } from '~/data/site'

const { years } = useClinic()
const root = ref<HTMLElement | null>(null)
const numeral = ref<HTMLElement | null>(null)

useGsapContext(root, (c) => {
  if (!c.desktop || c.reduce || !numeral.value) return undefined
  gsap.fromTo(
    numeral.value,
    { '--fill': '6%' },
    {
      '--fill': '100%',
      ease: 'none',
      scrollTrigger: { trigger: numeral.value, start: 'top 85%', end: 'bottom 45%', scrub: 0.6 },
    },
  )
  return undefined
})
</script>

<template>
  <section
    ref="root"
    class="chapter-blue section-clip py-(--space-section)"
    data-nav-theme="blue"
    aria-labelledby="exp-title"
  >
    <div class="container-wide">
      <div class="grid items-end gap-10 lg:grid-cols-12">
        <p ref="numeral" class="numeral mega lg:col-span-6" aria-hidden="true">{{ years }}</p>
        <div class="lg:col-span-5 lg:col-start-8">
          <h2 id="exp-title" v-reveal class="text-display-m text-bone">
            <ContentValue :value="site.foundedYear">{{ years }}</ContentValue> años cuidando de la salud de
            tus pies.
          </h2>
          <ContentValue
            v-reveal="1"
            :value="clinic.experienceText"
            as="p"
            class="measure mt-6 text-body-l text-text-secondary"
          />
        </div>
      </div>
      <ol v-if="clinic.milestones.length" class="mt-16 grid gap-6 border-t border-border pt-8 md:grid-cols-4">
        <li v-for="m in clinic.milestones" :key="m.year" v-reveal>
          <p class="font-display text-heading-s text-bone">{{ m.year }}</p>
          <p class="mt-2 text-text-secondary">{{ m.text }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.numeral {
  --fill: 100%;
  font-size: var(--text-numeral);
  line-height: 0.8;
  color: transparent;
  -webkit-text-stroke: 2px var(--color-bone);
  background: linear-gradient(to top, var(--color-bone) var(--fill), transparent var(--fill));
  background-clip: text;
  -webkit-background-clip: text;
  width: fit-content;
}
</style>
