/**
 * Directiva `v-reveal`: entrada estándar del sistema (spec 01 §8): `y 24 → 0` (16 px en móvil), opacidad
 * `0 → 1`, `--dur-reveal`, una sola vez al entrar en viewport (umbral 15 %).
 *
 * - Valor opcional: índice para el stagger (`v-reveal="i"` → i × 70 ms) o `{ delay }` en ms.
 * - Mejora progresiva: en el HTML del servidor no hay estado oculto. Al montar, solo se ocultan los elementos
 *   que todavía no están en el viewport (así no parpadea lo que ya se ve).
 * - Reduced motion: no hace nada (el contenido aparece tal cual).
 * Estilos en main.css (`[data-rv]`).
 */
import type { Directive } from 'vue'

type RevealValue = number | { delay?: number } | undefined

const STAGGER_MS = 70

export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | undefined

  const getObserver = () => {
    observer ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          el.dataset.rv = 'in'
          observer?.unobserve(el)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -5% 0px' },
    )
    return observer
  }

  const directive: Directive<HTMLElement, RevealValue> = {
    getSSRProps: () => ({}),
    mounted(el, binding) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) return

      const value = binding.value
      const delay = typeof value === 'number' ? value * STAGGER_MS : (value?.delay ?? 0)
      if (delay) el.style.setProperty('--rv-delay', `${delay}ms`)
      el.dataset.rv = 'out'
      getObserver().observe(el)
    },
    beforeUnmount(el) {
      observer?.unobserve(el)
    },
  }

  nuxtApp.vueApp.directive('reveal', directive)
})
