<script setup lang="ts">
/**
 * Pre-footer global: «Da el próximo paso.» + una frase de apoyo + «Pedir cita». Una banda azul Valdepodo de
 * altura contenida (no es un hero), con un trazo orgánico discreto de pasos que cruza por detrás. Lo pinta
 * el layout al final de todas las páginas (salvo en `/contacto`, donde ya está el formulario).
 * Estático a propósito: sin GSAP ni WebGL; solo la entrada `v-reveal` y el «rodar» del botón.
 */
withDefaults(
  defineProps<{
    title?: string
    text?: string
    cta?: { label: string; to: string }
  }>(),
  {
    title: 'Da el próximo paso',
    text: 'Cuéntanos cómo caminas y te acompañamos desde el primer paso.',
    cta: () => ({ label: 'Pedir cita', to: '/contacto#cita' }),
  },
)
</script>

<template>
  <section
    class="cta chapter-blue section-clip relative isolate"
    data-nav-theme="blue"
    aria-labelledby="cta-title"
  >
    <!-- Trazo abstracto: un camino con pasos (puntos) que entra por la derecha. Decorativo. -->
    <svg class="cta__path" viewBox="0 0 900 320" fill="none" aria-hidden="true" focusable="false">
      <path
        class="cta__path-solid"
        d="M-20 252 C 150 282, 230 112, 420 150 S 700 268, 920 84"
        vector-effect="non-scaling-stroke"
      />
      <path
        class="cta__path-dots"
        d="M-20 214 C 150 244, 240 84, 430 118 S 700 230, 920 48"
        vector-effect="non-scaling-stroke"
      />
      <circle cx="420" cy="150" r="5" class="cta__path-node" />
      <circle cx="660" cy="232" r="3.5" class="cta__path-node" />
    </svg>

    <div class="container-wide cta__inner">
      <h2 id="cta-title" v-reveal class="cta__title">
        {{ title }}<span class="cta__stop" aria-hidden="true">.</span>
      </h2>

      <div v-reveal="1" class="cta__side">
        <p class="cta__text">{{ text }}</p>
        <BaseButton variant="on-blue" :to="cta.to" arrow class="cta__button">{{ cta.label }}</BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta {
  padding-block: clamp(3.5rem, 6vw, 6rem);
}
.cta__path {
  position: absolute;
  z-index: -1;
  inset-block: 0;
  right: 0;
  width: min(100%, 70rem);
  height: 100%;
  pointer-events: none;
}
.cta__path path {
  stroke: var(--color-ice-blue);
  stroke-width: 1.25;
  stroke-linecap: round;
}
.cta__path-solid {
  opacity: 0.22;
}
.cta__path-dots {
  stroke-dasharray: 1 9;
  opacity: 0.5;
}
.cta__path-node {
  fill: var(--color-ice-blue);
  opacity: 0.55;
}

.cta__inner {
  display: grid;
  gap: 1.75rem;
  align-items: end;
}
.cta__title {
  font-family: var(--font-display);
  font-weight: 650;
  font-stretch: 75%;
  font-size: clamp(3rem, 1rem + 9vw, 8.5rem);
  line-height: 0.9;
  letter-spacing: -0.025em;
  max-width: 11ch;
}
.cta__stop {
  color: var(--color-ice-blue);
}
.cta__side {
  display: grid;
  justify-items: start;
  gap: 1.5rem;
}
.cta__text {
  max-width: 30ch;
  font-size: var(--text-body-l);
  line-height: var(--text-body-l--line-height);
  color: var(--color-bone);
}

@media (min-width: 1024px) {
  .cta__inner {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: 1.5rem;
  }
  .cta__title {
    grid-column: 1 / span 7;
    max-width: none;
  }
  .cta__side {
    grid-column: 9 / span 4;
    padding-bottom: 0.5rem;
  }
}
@media (max-width: 479px) {
  .cta__button {
    width: 100%;
  }
}
</style>
