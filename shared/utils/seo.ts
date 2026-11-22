/**
 * Utilidades SEO puras (sin Nuxt ni DOM), compartidas por la app (canonical, schema.org) y por el servidor
 * (`robots.txt`, `sitemap.xml`), para que las tres partes construyan las URLs exactamente igual.
 */

/**
 * URL absoluta de una ruta del sitio: origen público + `app.baseURL` + ruta.
 * Devuelve `undefined` si no hay URL pública configurada (`NUXT_PUBLIC_SITE_URL`).
 * Sin barra final salvo en la raíz, igual que las rutas que genera Nuxt.
 */
export function siteHref(siteUrl: string | undefined, baseURL: string, path: string): string | undefined {
  if (!siteUrl) return undefined
  const origin = siteUrl.replace(/\/+$/, '')
  const base = baseURL.replace(/\/+$/, '')
  const clean = path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}`
  return `${origin}${base}${clean}`
}

/** `robots.txt`: en producción permite todo y apunta al sitemap; en cualquier otro entorno bloquea el rastreo. */
export function buildRobotsTxt(opts: { production: boolean; sitemapUrl?: string }): string {
  if (!opts.production) return 'User-agent: *\nDisallow: /\n'
  const lines = ['User-agent: *', 'Allow: /', 'Disallow: /api/']
  if (opts.sitemapUrl) lines.push('', `Sitemap: ${opts.sitemapUrl}`)
  return `${lines.join('\n')}\n`
}

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** `sitemap.xml` con URLs únicas (en el orden recibido). */
export function buildSitemapXml(urls: readonly string[]): string {
  const unique = [...new Set(urls)]
  const entries = unique.map((u) => `  <url>\n    <loc>${escapeXml(u)}</loc>\n  </url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
}
