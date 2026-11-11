<script setup lang="ts">
/** Filosofía de la clínica (spec 05 §5): «Escuchar. Analizar. Tratar. Prevenir.» en cuatro filas tipográficas. */
</script>

<template>
  <section class="chapter-bone-2 py-(--space-section)" data-nav-theme="bone" aria-labelledby="philo-title">
    <div class="container-wide grid gap-12 lg:grid-cols-12">
      <div class="lg:col-span-5">
        <p v-reveal class="eyebrow text-primary-strong">Cómo trabajamos</p>
        <h2 id="philo-title" v-reveal class="mt-4 max-w-[10ch] text-display-l text-ink">
          Cuatro verbos, un solo paso.
        </h2>
      </div>
      <PhilosophyList class="lg:col-span-7" />
    </div>
  </section>
</template>
