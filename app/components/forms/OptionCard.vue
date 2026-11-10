<script setup lang="ts" generic="T extends string | boolean">
/**
 * Tarjeta seleccionable (spec 01 §6): input radio nativo (accesible por teclado con flechas dentro del
 * grupo) estilizado como tarjeta. Seleccionada: borde primary 2 px + check + fondo light-blue.
 * Va dentro de un <fieldset> con <legend> (lo pone `OptionGroup`).
 */
const props = withDefaults(
  defineProps<{ value: T; name: string; label: string; description?: string; disabled?: boolean }>(),
  { description: undefined, disabled: false },
)
const model = defineModel<T | null>({ required: true })
const checked = computed(() => model.value === props.value)
</script>

<template>
  <label class="option-card" :class="{ 'is-checked': checked, 'is-disabled': disabled }">
    <input
      type="radio"
      class="sr-only"
      :name="name"
      :checked="checked"
      :disabled="disabled"
      @change="model = value"
    />
    <span class="option-check" aria-hidden="true">
      <BaseIcon v-if="checked" name="check" class="size-4" />
    </span>
    <span class="min-w-0">
      <span class="block font-semibold text-deep-blue">{{ label }}</span>
      <span v-if="description" class="mt-0.5 block text-sm text-text-secondary">{{ description }}</span>
    </span>
  </label>
</template>

<style scoped>
.option-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  min-height: 64px;
  border: 1.5px solid var(--color-border-strong);
  border-radius: var(--radius-m);
  background: var(--color-white);
  padding: 0.875rem 1.125rem;
  cursor: pointer;
  transition:
    border-color var(--dur-fast) var(--ease-out-soft),
    background-color var(--dur-fast) var(--ease-out-soft),
    box-shadow var(--dur-fast) var(--ease-out-soft);
}
.option-check {
  display: grid;
  place-items: center;
  flex: none;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 1.5px solid var(--color-border-strong);
  background: var(--color-white);
  color: var(--color-white);
}
.option-card.is-checked {
  border: 2px solid var(--color-primary);
  padding: calc(0.875rem - 0.5px) calc(1.125rem - 0.5px);
  background: var(--color-light-blue);
}
.is-checked .option-check {
  border-color: var(--color-primary);
  background: var(--color-primary);
}
.option-card:has(input:focus-visible) {
  box-shadow: var(--focus-ring);
}
.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
@media (hover: hover) and (pointer: fine) {
  .option-card:not(.is-checked):hover {
    border-color: var(--color-primary);
  }
}
</style>
