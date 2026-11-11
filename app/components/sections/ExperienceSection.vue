<script setup lang="ts">
/**
 * Experiencia (spec 05 §4), minisección editorial de confianza: «9 años» como cifra protagonista, una
 * frase y el texto de trayectoria, entre filetes y con poca altura. Pausa visual entre el método y el
 * espacio de la clínica. Los años salen de `site.foundedYear`; línea de hitos solo si hay hitos reales.
 */
import { clinic } from '~/data/clinic'
import { site } from '~/data/site'

const { years } = useClinic()
</script>

<template>
  <section class="exp chapter-bone-2 section-clip" data-nav-theme="bone" aria-labelledby="exp-title">
    <div class="container-wide">
      <div class="exp__row">
        <h2 id="exp-title" v-reveal class="exp__headline">
          <span class="exp__num"
            ><ContentValue :value="site.foundedYear">{{ years }}</ContentValue></span
          >
          <span class="exp__rest">años cuidando de la salud de tus pies.</span>
        </h2>
        <ContentValue v-reveal="1" :value="clinic.experienceText" as="p" class="exp__text" />
      </div>

      <ol v-if="clinic.milestones.length" class="exp__milestones">
        <li v-for="m in clinic.milestones" :key="m.year">
          <p class="font-display text-heading-s text-ink">{{ m.year }}</p>
          <p class="mt-1 text-text-secondary">{{ m.text }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.exp {
  padding-block: clamp(2.5rem, 5vw, 4.5rem);
  border-block: 1px solid var(--color-border);
}
.exp__row {
  display: grid;
  gap: 1.25rem;
  align-items: center;
}
.exp__headline {
  display: flex;
  align-items: center;
  gap: clamp(0.75rem, 2vw, 1.5rem);
  color: var(--color-ink);
}
.exp__num {
  font-family: var(--font-display);
  font-weight: 650;
  font-stretch: 75%;
  font-size: clamp(6rem, 2.5rem + 10vw, 11.5rem);
  line-height: 0.8;
  letter-spacing: -0.03em;
  color: var(--color-primary-strong);
}
.exp__rest {
  max-width: 11ch;
  font-size: clamp(1.375rem, 1rem + 1.2vw, 2rem);
  line-height: 1.08;
  letter-spacing: -0.03em;
}
.exp__text {
  max-width: 44ch;
  color: var(--color-text-secondary);
}
.exp__milestones {
  display: grid;
  gap: 1.5rem;
  margin-top: 2rem;
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
}

@media (min-width: 768px) {
  .exp__milestones {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .exp__row {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: 1.5rem;
  }
  .exp__headline {
    grid-column: 1 / span 6;
  }
  .exp__text {
    grid-column: 8 / span 5;
  }
}
</style>
