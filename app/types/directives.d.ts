import type { Directive } from 'vue'

declare module 'vue' {
  interface GlobalDirectives {
    /** Entrada `reveal` (app/plugins/reveal.ts). */
    vReveal: Directive<HTMLElement, number | { delay?: number } | undefined>
  }
}

export {}
