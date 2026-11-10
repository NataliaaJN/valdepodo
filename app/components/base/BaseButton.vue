<script setup lang="ts">
/**
 * Botón del sistema de diseño (spec 01 §5).
 * Renderiza <NuxtLink> si recibe `to`/`href`, o <button> en caso contrario. Nunca un <div> clicable.
 */
import type { RouteLocationRaw } from 'vue-router'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'on-dark'
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

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover-fine:bg-primary-strong hover-fine:shadow-glow',
  secondary:
    'border-[1.5px] border-border-strong bg-white/60 text-deep-blue hover-fine:border-primary hover-fine:bg-white',
  ghost:
    'px-0! text-primary-strong underline decoration-1 underline-offset-[6px] decoration-transparent hover-fine:decoration-current',
  'on-dark': 'bg-white text-deep-blue hover-fine:bg-ice-blue',
}

const sizeClasses: Record<ButtonSize, string> = {
  md: 'min-h-12 px-6 text-[0.9375rem]',
  sm: 'min-h-11 px-5 text-sm',
}
</script>

<template>
  <component
    :is="isLink ? NuxtLinkComponent : 'button'"
    :to="isLink ? (to ?? href) : undefined"
    :type="isLink ? undefined : type"
    :disabled="!isLink && isInactive ? true : undefined"
    :aria-disabled="isInactive ? 'true' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    class="group inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-pill font-semibold tracking-[0.01em] transition-[background-color,box-shadow,border-color,text-decoration-color,transform] duration-(--dur-fast) ease-out-soft select-none active:scale-[0.98] aria-disabled:pointer-events-none aria-disabled:opacity-50"
    :class="[variantClasses[variant], sizeClasses[size]]"
  >
    <span
      v-if="loading"
      class="size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
      aria-hidden="true"
    />
    <span>{{ loading ? loadingLabel : '' }}<slot v-if="!loading" /></span>
    <svg
      v-if="arrow && !loading"
      class="size-4 transition-transform duration-(--dur-base) ease-out-soft group-hover:translate-x-1 motion-reduce:transition-none"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 8h11M9 3.5 13.5 8 9 12.5"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </component>
</template>
