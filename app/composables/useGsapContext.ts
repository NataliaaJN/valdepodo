import { gsap } from 'gsap'
import type { Ref } from 'vue'

/** Condiciones de `gsap.matchMedia` compartidas por todo el proyecto (spec 01 §3 y §8). */
export const MOTION_CONDITIONS = {
  desktop: '(min-width: 1024px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  mobile: '(max-width: 767px)',
  reduce: '(prefers-reduced-motion: reduce)',
  motion: '(prefers-reduced-motion: no-preference)',
} as const

export type MotionConditions = Record<keyof typeof MOTION_CONDITIONS, boolean>

/**
 * Crea animaciones GSAP acotadas a un elemento y las revierte al desmontar
 * (limpia ScrollTriggers, estilos inline y listeners). Compatible con navegación entre páginas.
 *
 * setup recibe las condiciones activas para ramificar por breakpoint y reduced motion.
 */
export function useGsapContext(
  scope: Ref<HTMLElement | null | undefined>,
  setup: (conditions: MotionConditions) => (() => void) | undefined,
) {
  let mm: gsap.MatchMedia | undefined

  onMounted(() => {
    if (!scope.value) return
    mm = gsap.matchMedia(scope.value)
    mm.add(MOTION_CONDITIONS, (context) => setup(context.conditions as MotionConditions))
  })

  onBeforeUnmount(() => {
    mm?.revert()
    mm = undefined
  })
}
