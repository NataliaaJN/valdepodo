<script setup lang="ts">
/**
 * Experiencia (spec 05 §4): numeral gigante con los años (desde `site.foundedYear`), en contorno y con un
 * relleno que sube con el scroll (scrub corto, solo escritorio y sin reduced motion; si no, relleno
 * completo). Línea temporal solo con hitos reales.
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
    { '--fill': '8%' },
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
  <section ref="root" class="container-site py-(--space-section)" aria-labelledby="exp-title">
    <div class="grid items-center gap-10 lg:grid-cols-12">
      <p ref="numeral" class="numeral font-display lg:col-span-5" aria-hidden="true">{{ years }}</p>
      <div class="lg:col-span-6 lg:col-start-7">
        <h2 id="exp-title" v-reveal class="font-display text-display-m text-deep-blue">
          <ContentValue :value="site.foundedYear">{{ years }}</ContentValue> años cuidando de la salud de
          <em class="text-primary">tus pies</em>.
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
        <p class="font-display text-heading-s text-primary">{{ m.year }}</p>
        <p class="mt-2 text-text-secondary">{{ m.text }}</p>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.numeral {
  --fill: 100%;
  font-size: clamp(9rem, 4rem + 22vw, 20rem);
  line-height: 0.8;
  letter-spacing: -0.04em;
  color: transparent;
  -webkit-text-stroke: 1.5px var(--color-primary);
  background: linear-gradient(to top, var(--color-light-blue) var(--fill), transparent var(--fill));
  background-clip: text;
  -webkit-background-clip: text;
}
</style>
