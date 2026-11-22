<script setup lang="ts">
/** Casilla de verificación nativa estilizada (spec 01 §6), con error asociado y área táctil ≥ 44 px. */
const props = withDefaults(defineProps<{ id: string; error?: string; disabled?: boolean }>(), {
  error: undefined,
  disabled: false,
})
const model = defineModel<boolean>({ required: true })
const errorId = computed(() => (props.error ? `${props.id}-error` : undefined))
</script>

<template>
  <div>
    <div class="checkbox-row">
      <input
        :id="id"
        v-model="model"
        type="checkbox"
        class="checkbox"
        :disabled="disabled"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="errorId"
      />
      <label :for="id" class="text-sm text-text"><slot /></label>
    </div>
    <p v-if="error" :id="errorId" class="mt-2 flex items-start gap-1.5 text-sm font-semibold text-error">
      <BaseIcon name="alert" class="mt-0.5 size-4" />
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.checkbox-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  min-height: 44px;
}
.checkbox {
  flex: none;
  width: 22px;
  height: 22px;
  margin-top: 0.05rem;
  accent-color: var(--color-primary);
  cursor: pointer;
}
.checkbox[aria-invalid='true'] {
  outline: 2px solid var(--color-error);
  outline-offset: 2px;
}
</style>
