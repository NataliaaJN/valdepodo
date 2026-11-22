import { describe, expect, it } from 'vitest'
import { buildRobotsTxt, buildSitemapXml, siteHref } from '#shared/utils/seo'
import { site } from '~/data/site'
import { servicePath, services } from '~/features/services/data/services'

describe('siteHref', () => {
  it('compone origen + baseURL + ruta, sin barra final salvo en la raíz', () => {
    expect(siteHref('https://valdepodo.es', '/', '/')).toBe('https://valdepodo.es/')
    expect(siteHref('https://valdepodo.es/', '/', '/contacto/')).toBe('https://valdepodo.es/contacto')
    expect(siteHref('https://u.github.io', '/valdepodo/', '/servicios')).toBe(
      'https://u.github.io/valdepodo/servicios',
    )
    expect(siteHref('https://u.github.io', '/valdepodo/', '/')).toBe('https://u.github.io/valdepodo/')
  })
  it('sin URL pública no hay URL absoluta', () => {
    expect(siteHref('', '/', '/contacto')).toBeUndefined()
  })
})

describe('robots.txt', () => {
  it('producción: permite el rastreo y enlaza el sitemap', () => {
    const txt = buildRobotsTxt({ production: true, sitemapUrl: 'https://valdepodo.es/sitemap.xml' })
    expect(txt).toContain('Allow: /')
    expect(txt).toContain('Sitemap: https://valdepodo.es/sitemap.xml')
    // Nunca se bloquean los recursos necesarios para renderizar
    expect(txt).not.toMatch(/Disallow: \/(_nuxt|images|videos|models)/)
  })
  it('fuera de producción bloquea todo el rastreo', () => {
    expect(buildRobotsTxt({ production: false })).toBe('User-agent: *\nDisallow: /\n')
  })
})

describe('sitemap.xml', () => {
  it('lista URLs únicas y escapa caracteres XML', () => {
    const xml = buildSitemapXml(['https://a.es/', 'https://a.es/', 'https://a.es/x?a=1&b=2'])
    expect(xml.match(/<loc>/g)).toHaveLength(2)
    expect(xml).toContain('&amp;')
  })
  it('las rutas indexables (navegación + servicios) son únicas y no incluyen legales ni /pedir-cita', () => {
    const paths = [...site.nav.map((i) => i.to.split('#')[0]), ...services.map((s) => servicePath(s.slug))]
    expect(new Set(paths).size).toBe(paths.length)
    for (const legal of site.legalNav) expect(paths).not.toContain(legal.to)
    expect(paths).not.toContain('/pedir-cita')
  })
})
