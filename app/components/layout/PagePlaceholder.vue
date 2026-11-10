<script setup lang="ts">
/**
 * Página provisional (Fase 5): existe para que la navegación de la propuesta visual no lleve a un 404.
 * Su contenido real se desarrolla en la Fase 6 (spec indicada en `spec`).
 */
const props = defineProps<{ eyebrow: string; title: string; spec: string }>()

useSeoMeta({ title: props.title, robots: 'noindex, nofollow' })
</script>

<template>
  <section class="section-clip relative isolate py-(--space-section)">
    <div class="pointer-events-none absolute inset-0 -z-10 bg-(image:--grad-atmosphere)" aria-hidden="true" />
    <div class="container-site max-w-[60rem]">
      <p class="eyebrow text-primary-strong">{{ eyebrow }}</p>
      <h1 class="mt-4 font-display text-display-l text-deep-blue">{{ title }}</h1>
      <p class="mt-6 max-w-[52ch] text-body-l text-text-secondary">
        Esta página se desarrolla en la Fase 6 ({{ spec }}). Por ahora solo forma parte de la navegación de la
        propuesta visual.
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <BaseButton to="/" variant="secondary">Volver al inicio</BaseButton>
        <BaseButton to="/servicios/estudio-biomecanico" variant="ghost"
          >Ver el Estudio biomecánico</BaseButton
        >
      </div>
    </div>
  </section>
</template>
