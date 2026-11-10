import tailwindcss from '@tailwindcss/vite'
import templateCompilerOptions from '@tresjs/core/template-compiler-options'

// Laboratorio de experiencias (/_lab): visible en desarrollo y, opcionalmente, en previews.
const enableLab = process.env.NODE_ENV !== 'production' || process.env.NUXT_PUBLIC_ENABLE_LAB === 'true'

export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',

  modules: ['@nuxt/fonts', '@nuxt/eslint'],

  devtools: { enabled: true },

  // Nombres de componente sin prefijo de carpeta (SceneGate, no ThreeSceneGate), como en las specs.
  components: [{ path: '~/components', pathPrefix: false }],

  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        noUncheckedIndexedAccess: true,
      },
    },
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      meta: [{ name: 'theme-color', content: '#F5F8FC' }],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  // TresJS sin el módulo @tresjs/nuxt: se registran sus elementos personalizados en el compilador de Vue.
  // Motivo: @tresjs/nuxt arrastra @nuxt/ui como dependencia (para su panel de devtools). Ver docs/01-research.md §2.1.
  vue: {
    compilerOptions: templateCompilerOptions.template.compilerOptions,
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['three', '@tresjs/core', 'gsap', 'gsap/ScrollTrigger'],
    },
  },

  fonts: {
    defaults: {
      weights: [400, 500, 600, 700],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
    },
    families: [
      // Propuesta A (por defecto)
      { name: 'Instrument Serif', provider: 'google', weights: [400], styles: ['normal', 'italic'] },
      { name: 'Manrope', provider: 'google', weights: [400, 500, 600, 700], styles: ['normal'] },
      // Propuesta B (comparación en la propuesta visual)
      { name: 'DM Serif Display', provider: 'google', weights: [400], styles: ['normal', 'italic'] },
      { name: 'DM Sans', provider: 'google', weights: [400, 500, 600, 700], styles: ['normal', 'italic'] },
    ],
  },

  routeRules: {
    '/**': { prerender: true },
    '/api/**': { prerender: false },
  },

  runtimeConfig: {
    // Secretos (solo servidor). Se rellenan con variables NUXT_* en el entorno.
    mailProvider: '',
    mailApiKey: '',
    mailFrom: '',
    bookingToEmail: '',
    turnstileSecretKey: '',
    formHmacSecret: '',
    public: {
      siteEnv: 'development',
      siteUrl: '',
      turnstileSiteKey: '',
      enableLab: enableLab,
    },
  },

  // Estáticos precomprimidos (gzip/brotli) también en `nuxt preview`, como en el hosting final
  nitro: {
    compressPublicAssets: true,
  },

  hooks: {
    // Spec 09 §3: en producción no puede quedar contenido provisional (`pending`)
    async 'build:before'() {
      if (process.env.NUXT_PUBLIC_SITE_ENV !== 'production') return
      const { findPending } = await import('./tools/check-pending.mjs')
      const entries = await findPending()
      if (entries.length) {
        throw new Error(
          `Quedan ${entries.length} marcadores pending() (npm run check:pending). El build de producción se detiene.`,
        )
      }
    },
    // Sin <link rel="prefetch"> de los chunks asíncronos: el de three/TresJS (~850 KB sin comprimir) se
    // descargaba en toda visita aunque la escena 3D no llegue a cargarse (p. ej. móvil sin interacción).
    // La navegación no lo nota: NuxtLink precarga las páginas por su cuenta.
    'build:manifest'(manifest) {
      for (const chunk of Object.values(manifest)) chunk.prefetch = false
    },
    'pages:extend'(pages) {
      if (enableLab) return
      for (let i = pages.length - 1; i >= 0; i--) {
        if (pages[i]?.path.startsWith('/_lab')) pages.splice(i, 1)
      }
    },
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },
})
