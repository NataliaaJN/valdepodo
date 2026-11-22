/**
 * `sitemap.xml` (spec 10 §3). Se prerenderiza en el build (nuxt.config.ts → nitro.prerender.routes).
 * Solo páginas indexables: las de la navegación principal y cada servicio. Quedan fuera los textos legales y
 * créditos (`noindex`), `/pedir-cita` (redirección a `/contacto#cita`) y `/_lab` (solo desarrollo).
 * Las URLs son las canónicas (origen público + baseURL, sin barra final).
 */
import { buildSitemapXml, siteHref } from '#shared/utils/seo'
import { site } from '~/data/site'
import { servicePath, services } from '~/features/services/data/services'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const paths = [
    ...site.nav.map((item) => item.to.split('#')[0] ?? '/'),
    ...services.map((s) => servicePath(s.slug)),
  ]
  const urls = paths.flatMap((path) => siteHref(config.public.siteUrl, config.app.baseURL, path) ?? [])
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return buildSitemapXml(urls)
})
