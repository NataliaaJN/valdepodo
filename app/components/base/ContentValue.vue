<script setup lang="ts">
/**
 * Muestra un valor de contenido que puede estar pendiente de validar (spec 09 §2).
 * Fuera de producción, el contenido `pending` se marca con un subrayado discontinuo y la nota como tooltip.
 */
import { isPending, resolveValue, type Maybe } from '#shared/utils/pending'

const props = withDefaults(defineProps<{ value: Maybe<string>; as?: string }>(), { as: 'span' })

const config = useRuntimeConfig()
const pendingNote = computed(() => (isPending(props.value) ? props.value.note : null))
const showBadge = computed(() => pendingNote.value !== null && config.public.siteEnv !== 'production')
</script>

<template>
  <component
    :is="as"
    :class="{ 'pending-mark': showBadge }"
    :title="showBadge ? `Pendiente: ${pendingNote}` : undefined"
  >
    {{ resolveValue(value) }}
  </component>
</template>

<style scoped>
.pending-mark {
  text-decoration: underline dashed var(--color-cyan);
  text-decoration-thickness: 1.5px;
  text-underline-offset: 0.25em;
  cursor: help;
}
</style>
