import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Registro global de GSAP + ScrollTrigger (solo cliente).
 * - ignoreMobileResize: evita recalcular al mostrar/ocultar la barra del navegador en móvil.
 * - Refresco tras cambiar de página y al cargar las fuentes (evita posiciones erróneas).
 */
export default defineNuxtPlugin((nuxtApp) => {
  gsap.registerPlugin(ScrollTrigger)
  ScrollTrigger.config({ ignoreMobileResize: true })

  nuxtApp.hook('page:finish', () => {
    requestAnimationFrame(() => ScrollTrigger.refresh())
  })

  document.fonts?.ready.then(() => ScrollTrigger.refresh())

  return {
    provide: { gsap, ScrollTrigger },
  }
})
