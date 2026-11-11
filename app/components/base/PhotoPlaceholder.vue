<script setup lang="ts">
/**
 * Marcador de fotografía pendiente (spec 09 §2): ilustración neutra de marca con el texto "Fotografía
 * pendiente". **Nunca stock.** Se muestra también en producción si faltara una foto, aunque el build de
 * producción falla antes por los `pending()` asociados.
 */
withDefaults(defineProps<{ label?: string; ratio?: string; variant?: 'portrait' | 'space' }>(), {
  label: 'Fotografía pendiente',
  ratio: '4 / 3',
  variant: 'space',
})
</script>

<template>
  <div class="photo-placeholder" :style="{ aspectRatio: ratio }" role="img" :aria-label="label">
    <svg
      viewBox="0 0 200 160"
      class="ph-art"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
    >
      <template v-if="variant === 'portrait'">
        <circle cx="100" cy="62" r="24" />
        <path d="M52 150c4-30 24-48 48-48s44 18 48 48" />
      </template>
      <template v-else>
        <path d="M20 130h160M40 130V70l60-34 60 34v60" />
        <path d="M84 130v-34h32v34" />
        <circle cx="152" cy="40" r="10" />
      </template>
    </svg>
    <span class="ph-label">
      <BaseIcon name="info" class="size-4" />
      {{ label }}
    </span>
  </div>
</template>

<style scoped>
.photo-placeholder {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  overflow: hidden;
  background: var(--color-ink);
}
.ph-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  fill: none;
  stroke: var(--color-ice-blue);
  stroke-width: 1.25;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.4;
}
.ph-art * {
  vector-effect: non-scaling-stroke;
}
.ph-label {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px dashed var(--color-cyan);
  border-radius: var(--radius-s);
  background: var(--color-bone);
  padding: 0.3rem 0.8rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-ink);
}
</style>
