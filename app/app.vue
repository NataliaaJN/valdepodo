<script setup lang="ts">
/**
 * Raíz de la app.
 * - Título por defecto y plantilla de títulos.
 * - Indexación: solo en producción (spec 10 §3: `noindex` en previews y desarrollo).
 * - Decisión del loading de marca antes del primer pintado (spec 02 §1): primera visita de la sesión y sin
 *   reduced motion → `data-intro="play"`.
 * - Schema.org de la clínica (spec 03 SEO, spec 07 §5), común a todas las páginas.
 */
// Fuentes autoalojadas: se precargan los subconjuntos latinos (el resto se descarga solo si hace falta)
import bricolageLatin from '@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-standard-normal.woff2?url'
import instrumentLatin from '@fontsource-variable/instrument-sans/files/instrument-sans-latin-standard-normal.woff2?url'

const config = useRuntimeConfig()
const isProduction = config.public.siteEnv === 'production'

const INTRO_SCRIPT = `(function(){var d=document.documentElement;try{var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;var s=sessionStorage.getItem('vp-intro');d.dataset.intro=r||s?'skip':'play';sessionStorage.setItem('vp-intro','1')}catch(e){d.dataset.intro='skip'}})()`

useHead({
  titleTemplate: (title) => (title ? `${title} · Valdepodo` : 'Valdepodo · Clínica de podología'),
  script: [{ key: 'vp-intro', innerHTML: INTRO_SCRIPT, tagPosition: 'head' }],
  link: [bricolageLatin, instrumentLatin].map((href) => ({
    rel: 'preload',
    as: 'font',
    type: 'font/woff2',
    href,
    crossorigin: 'anonymous' as const,
  })),
})

useSeoMeta({
  robots: isProduction ? 'index, follow, max-image-preview:large' : 'noindex, nofollow',
  ogSiteName: 'Valdepodo',
  ogLocale: 'es_ES',
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useClinicSchema()
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <BrandIntro />
</template>
