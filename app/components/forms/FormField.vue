<script setup lang="ts">
/**
 * Campo de formulario (spec 01 §6): label siempre visible, input de 52 px, borde border-strong, anillo de
 * foco y error textual con icono asociado por `aria-describedby` (nunca solo color).
 * El control va en el slot y recibe los atributos accesibles por props del slot.
 */
const props = withDefaults(
  defineProps<{ id: string; label: string; hint?: string; error?: string; optional?: boolean }>(),
  { hint: undefined, error: undefined, optional: false },
)

const describedBy = computed(
  () =>
    [props.hint ? `${props.id}-hint` : '', props.error ? `${props.id}-error` : '']
      .filter(Boolean)
      .join(' ') || undefined,
)
</script>

<template>
  <div class="form-field">
    <label :for="id" class="block font-semibold text-deep-blue">
      {{ label }}
      <span v-if="optional" class="font-normal text-text-secondary">(opcional)</span>
    </label>
    <p v-if="hint" :id="`${id}-hint`" class="mt-1 text-sm text-text-secondary">{{ hint }}</p>
    <div class="mt-2">
      <slot :id="id" :described-by="describedBy" :invalid="Boolean(error)" />
    </div>
    <p v-if="error" :id="`${id}-error`" class="field-error">
      <BaseIcon name="alert" class="size-4" />
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.field-error {
  margin-top: 0.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-error);
}
.field-error :deep(svg) {
  margin-top: 0.1rem;
}
</style>

<style>
@layer components {
  .text-input {
    display: block;
    width: 100%;
    min-height: 52px;
    border: 1.5px solid var(--color-border-strong);
    border-radius: var(--radius-s);
    background: var(--color-white);
    padding: 0.75rem 1rem;
    color: var(--color-text);
    font-size: 1rem;
    transition: border-color var(--dur-fast) var(--ease-out-soft);
  }
  .text-input:hover {
    border-color: var(--color-primary);
  }
  .text-input:focus-visible {
    border-color: var(--color-primary-strong);
    border-radius: var(--radius-s);
  }
  .text-input[aria-invalid='true'] {
    border-color: var(--color-error);
  }
  .text-input:disabled {
    opacity: 0.6;
  }
}
</style>
