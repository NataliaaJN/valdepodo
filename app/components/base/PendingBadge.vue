<script setup lang="ts">
/**
 * Aviso de recurso provisional (spec 09 §2, plan §2.3). Solo en desarrollo y previews: en producción no se
 * renderiza (y el build de producción fallará antes si queda contenido `pending`).
 */
withDefaults(defineProps<{ label: string; note?: string }>(), { note: undefined })

const config = useRuntimeConfig()
const visible = computed(() => config.public.siteEnv !== 'production')
</script>

<template>
  <span v-if="visible" class="pending-badge" :title="note ? `Pendiente: ${note}` : undefined">
    <span class="dot" aria-hidden="true" />
    {{ label }}
  </span>
</template>

<style scoped>
.pending-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px dashed var(--color-cyan);
  border-radius: var(--radius-pill);
  background: rgb(255 255 255 / 0.8);
  backdrop-filter: blur(6px);
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-cyan-ink);
  cursor: help;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--color-cyan);
}
</style>
