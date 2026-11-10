<script setup lang="ts">
/**
 * Conmutador de la propuesta tipográfica A/B (plan Fase 5). Solo fuera de producción.
 * La variante va en la URL (`?tipo=b`) para poder compartir el enlace con la clínica.
 * A: Instrument Serif + Manrope · B: DM Serif Display + DM Sans (main.css → .type-b).
 */
const route = useRoute()
const config = useRuntimeConfig()
const visible = config.public.siteEnv !== 'production'
const variant = computed(() => (route.query.tipo === 'b' ? 'b' : 'a'))

useHead({ htmlAttrs: { class: computed(() => (variant.value === 'b' ? 'type-b' : undefined)) } })

const linkFor = (v: 'a' | 'b') => ({
  query: { ...route.query, tipo: v === 'b' ? 'b' : undefined },
  hash: route.hash,
})
</script>

<template>
  <div v-if="visible" class="proposal-toolbar" role="group" aria-label="Propuesta tipográfica">
    <span class="label">Tipografía</span>
    <NuxtLink
      v-for="v in ['a', 'b'] as const"
      :key="v"
      :to="linkFor(v)"
      replace
      :aria-current="variant === v ? 'true' : undefined"
      class="option"
      :title="v === 'a' ? 'Instrument Serif + Manrope' : 'DM Serif Display + DM Sans'"
      >{{ v.toUpperCase() }}</NuxtLink
    >
  </div>
</template>

<style scoped>
.proposal-toolbar {
  position: fixed;
  left: 12px;
  bottom: 12px;
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: var(--radius-pill);
  background: var(--color-deep-blue);
  padding: 0.25rem 0.25rem 0.25rem 0.75rem;
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 0.75rem;
  color: var(--color-ice-blue);
  box-shadow: var(--shadow-float);
}
.label {
  margin-right: 0.25rem;
}
.option {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  font-weight: 700;
  color: var(--color-white);
}
.option[aria-current='true'] {
  background: var(--color-white);
  color: var(--color-deep-blue);
}
</style>
