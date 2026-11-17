<script setup lang="ts" generic="T = string">
/**
 * Muestra un valor de contenido (spec 09 §2). El contenido está confirmado por la clínica, así que ya no se
 * marca con subrayado discontinuo ni tooltip: se pinta el valor resuelto tal cual.
 *
 * - Cadenas: `<ContentValue :value="site.city" />`.
 * - Cualquier otro valor (objetos, números): slot con el valor resuelto,
 *   `<ContentValue :value="site.instagram" v-slot="{ value }">{{ value.handle }}</ContentValue>`.
 */
import { resolveValue, type Maybe } from '#shared/utils/pending'

const props = withDefaults(defineProps<{ value: Maybe<T>; as?: string }>(), { as: 'span' })
defineSlots<{ default?: (props: { value: T }) => unknown }>()

const resolved = computed(() => resolveValue(props.value))
</script>

<template>
  <component :is="as">
    <slot :value="resolved">{{ resolved }}</slot>
  </component>
</template>
