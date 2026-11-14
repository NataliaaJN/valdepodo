<script setup lang="ts">
/**
 * Botón del sistema de diseño. Radio de 8 px. Hover sutil:
 * ligero cambio de tono y la flecha avanza un par de píxeles.
 * Renderiza <NuxtLink> si recibe `to`/`href`, o <button> en caso contrario. Nunca un <div> clicable.
 *
 * - `primary`: cyan con texto tinta (hover: tinta con texto hueso). Es el botón estándar.
 * - `on-blue`: hueso sobre cyan o tinta (hover: cyan).
 * - `secondary`: filete (hover: se rellena de tinta).
 * - `ghost`: enlace subrayado.
 */
import type { RouteLocationRaw } from 'vue-router'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'on-dark' | 'on-blue'
export type ButtonSize = 'md' | 'sm'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    to?: RouteLocationRaw
    href?: string
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
    /** Texto alternativo mientras `loading` es true. */
    loadingLabel?: string
    /** Muestra la flecha de avance. */
    arrow?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    to: undefined,
    href: undefined,
    type: 'button',
    disabled: false,
    loading: false,
    loadingLabel: 'Enviando…',
    arrow: false,
  },
)

const NuxtLinkComponent = resolveComponent('NuxtLink')
const isLink = computed(() => props.to !== undefined || props.href !== undefined)
const isInactive = computed(() => props.disabled || props.loading)
</script>

<template>
  <component
    :is="isLink ? NuxtLinkComponent : 'button'"
    :to="isLink ? (to ?? href) : undefined"
    :type="isLink ? undefined : type"
    :disabled="!isLink && isInactive ? true : undefined"
    :aria-disabled="isInactive ? 'true' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`]"
  >
    <span
      v-if="loading"
      class="size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
      aria-hidden="true"
    />
    <span v-if="loading">{{ loadingLabel }}</span>
    <span v-else class="btn__label">
      <span class="btn__text"><slot /></span>
    </span>
    <span v-if="arrow && !loading" class="btn__arrow" aria-hidden="true">
      <svg viewBox="0 0 16 16" fill="none">
        <path
          d="M2 8h11M9 3.5 13.5 8 9 12.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="square"
        />
      </svg>
    </span>
  </component>
</template>

<style scoped>
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.875rem;
  border: 1px solid transparent;
  border-radius: var(--radius-m);
  font-weight: 600;
  letter-spacing: 0.005em;
  cursor: pointer;
  user-select: none;
  transition:
    background-color var(--dur-base) var(--ease-out-soft),
    color var(--dur-base) var(--ease-out-soft),
    border-color var(--dur-base) var(--ease-out-soft),
    transform var(--dur-fast) var(--ease-out-soft);
}
.btn:active {
  transform: scale(0.985);
}
.btn[aria-disabled='true'] {
  pointer-events: none;
  opacity: 0.5;
}

.btn--md {
  min-height: 3.25rem;
  padding-inline: 1.75rem;
  font-size: 0.9375rem;
}
.btn--sm {
  min-height: 2.75rem;
  padding-inline: 1rem;
  font-size: 0.875rem;
}

.btn--primary {
  background: var(--color-primary);
  color: var(--color-ink);
}
.btn--on-blue,
.btn--on-dark {
  background: var(--color-bone);
  color: var(--color-ink);
}
.btn--secondary {
  border-color: var(--color-ink);
  color: var(--color-ink);
  background: transparent;
}
.btn--ghost {
  padding-inline: 0;
  min-height: 2.75rem;
  color: var(--color-primary-strong);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 6px;
  text-decoration-color: transparent;
}

/* Texto que rueda: dos copias apiladas, la de arriba sale y entra la de abajo */
.btn__label {
  display: inline-grid;
  overflow: hidden;
  line-height: 1.25;
  padding-block: 0.1em;
  margin-block: -0.1em;
}
.btn__text {
  grid-area: 1 / 1;
  transition: transform var(--dur-base) var(--ease-out-soft);
}

.btn__arrow {
  display: inline-grid;
  overflow: hidden;
  width: 1rem;
  height: 1rem;
}
.btn__arrow svg {
  grid-area: 1 / 1;
  width: 1rem;
  height: 1rem;
  transition: transform var(--dur-base) var(--ease-out-soft);
}

/* Hover claro pero contenido: cambio de color de marca y la flecha avanza unos píxeles */
@media (hover: hover) and (pointer: fine) {
  .btn--primary:hover {
    background: var(--color-ink);
    color: var(--color-bone);
  }
  .btn--on-blue:hover,
  .btn--on-dark:hover {
    background: var(--color-primary);
    color: var(--color-ink);
  }
  .btn--secondary:hover {
    background: color-mix(in srgb, var(--color-ink) 12%, transparent);
  }
  .btn--ghost:hover {
    text-decoration-color: currentColor;
  }
  .btn:hover .btn__arrow svg:first-child {
    transform: translateX(3px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn,
  .btn__text,
  .btn__arrow svg {
    transition: none;
  }
}
</style>
