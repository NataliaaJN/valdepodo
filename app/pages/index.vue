<script setup lang="ts">
/**
 * Página de inicio provisional (Fase 1). La Home real se construye en las Fases 5-6 (spec 03).
 * No contiene datos de la clínica: solo comprueba tokens, tipografía, logo y botones.
 */
useSeoMeta({
  title: 'En construcción',
  description: 'Nueva web de Valdepodo, clínica de podología. En desarrollo.',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <section class="section-clip relative isolate py-(--space-section)">
    <div class="pointer-events-none absolute inset-0 -z-10 bg-(image:--grad-atmosphere)" aria-hidden="true" />
    <div class="container-site grid items-center gap-12 lg:grid-cols-12">
      <div class="lg:col-span-6">
        <p class="eyebrow text-primary-strong">Clínica de podología</p>
        <h1 class="mt-4 font-display text-display-xl text-deep-blue">
          Todo empieza por tus <em class="text-primary">pies</em>.
        </h1>
        <p class="mt-6 max-w-[52ch] text-body-l text-text-secondary">
          Estamos construyendo la nueva web de Valdepodo. Esta página es provisional y solo sirve para
          comprobar la base técnica del proyecto.
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <BaseButton arrow to="/">Pedir cita</BaseButton>
          <BaseButton variant="secondary" to="/">Descubrir servicios</BaseButton>
        </div>
      </div>
      <div class="mx-auto w-full max-w-[280px] lg:col-span-5 lg:col-start-8 lg:max-w-[340px]">
        <BrandLogo variant="symbol" label="" />
      </div>
    </div>
  </section>
</template>
