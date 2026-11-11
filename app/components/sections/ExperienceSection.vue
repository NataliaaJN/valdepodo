<script setup lang="ts">
/**
 * Experiencia (spec 05 §4), minisección centrada y baja: la cifra de años y una frase, entre filetes. Pausa visual entre el método y el
 * espacio de la clínica. Los años salen de `site.foundedYear` (confirmado); línea de hitos solo si hay hitos reales.
 */
import { clinic } from '~/data/clinic'

const { years } = useClinic()
</script>

<template>
  <section class="exp chapter-bone-2 section-clip" data-nav-theme="bone" aria-labelledby="exp-title">
    <div class="container-wide">
      <div class="exp__row">
        <h2 id="exp-title" v-reveal class="exp__headline">
          <span class="exp__num"
            >{{ years }}</span
          >
          <span class="exp__rest">años cuidando de la salud de tus pies.</span>
        </h2>
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
  padding-block: clamp(1.5rem, 3vw, 2.5rem);
  border-block: 1px solid var(--color-border);
}
.exp__row {
  display: flex;
  justify-content: center;
}
.exp__headline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.75rem, 2vw, 1.5rem);
  color: var(--color-ink);
}
.exp__num {
  font-family: var(--font-display);
  font-weight: 650;
  font-stretch: 75%;
  font-size: clamp(4rem, 2rem + 6vw, 7rem);
  line-height: 0.8;
  letter-spacing: -0.03em;
  color: var(--color-primary-strong);
}
.exp__rest {
  white-space: nowrap;
  font-size: clamp(1rem, 0.7rem + 1.4vw, 1.75rem);
  line-height: 1.08;
  letter-spacing: -0.03em;
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
</style>
