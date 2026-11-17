<script setup lang="ts">
/**
 * Pausa bajo el hero: una sola frase en tipografía grande que condensa los valores de la clínica (años de
 * experiencia, trato cercano, tecnología). Sin tarjetas: el hero es hueso, los servicios son tinta y esta banda
 * es el puente plano en cian muy claro. La primera parte va en tinta y el resto en tinta atenuada.
 * Texto provisional hasta que la clínica lo valide.
 */
import { resolveValue } from '#shared/utils/pending'
import { site } from '~/data/site'

const clinic = useClinic()
const city = resolveValue(site.city)
</script>

<template>
  <section class="facts relative" data-nav-theme="bone" aria-labelledby="datos-title">
    <h2 id="datos-title" class="sr-only">Valdepodo en datos</h2>
    <div class="container-wide">
      <p class="facts__statement">
        <span class="facts__lead"
          ><ContentValue :value="site.foundedYear" as="span">{{ clinic.years }}</ContentValue> años cuidando los pies
          de {{ city }}</span
        >
        <span class="facts__tail">, con trato cercano y la tecnología para estudiar cada pisada.</span>
      </p>
    </div>
  </section>
</template>

<style scoped>
.facts {
  z-index: 2;
  padding-block: clamp(3rem, 7vw, 5.5rem);
  background: var(--color-cyan-mist);
  color: var(--color-ink);
}
.facts__statement {
  max-width: 24em;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(1.75rem, 1.1rem + 2.6vw, 3.25rem);
  line-height: 1.08;
  letter-spacing: -0.03em;
  text-wrap: balance;
}
.facts__tail {
  color: rgb(6 26 44 / 0.56);
}
</style>
