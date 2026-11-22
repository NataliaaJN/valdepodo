/**
 * `robots.txt` (spec 10 §3). Se prerenderiza en el build (nuxt.config.ts → nitro.prerender.routes).
 * Producción: rastreo libre (también CSS, JS e imágenes) salvo `/api/`, y enlace al sitemap.
 * Cualquier otro entorno (desarrollo, previews): rastreo bloqueado.
 */
import { buildRobotsTxt, siteHref } from '#shared/utils/seo'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return buildRobotsTxt({
    production: config.public.siteEnv === 'production',
    sitemapUrl: siteHref(config.public.siteUrl, config.app.baseURL, '/sitemap.xml'),
  })
})
