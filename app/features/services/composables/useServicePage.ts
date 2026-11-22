/**
 * SEO común de las páginas de servicio (spec 04): título, descripción, `Service` y breadcrumbs.
 */
import { resolveValue } from '#shared/utils/pending'
import { site } from '~/data/site'
import { getService, servicePath } from '~/features/services/data/services'

export function useServicePage(slug: string) {
  const service = getService(slug)
  const path = servicePath(slug)
  const description = resolveValue(service.description)

  // Título con la intención de búsqueda: servicio + ciudad (la marca la añade la plantilla de títulos)
  const title = `${service.seoTitle ?? service.name} en ${resolveValue(site.city)}`

  usePageSeo({ title, description, path })
  useServiceSchema({ name: service.name, description, path })
  useBreadcrumbSchema([
    { name: 'Inicio', path: '/' },
    { name: 'Servicios', path: '/servicios' },
    { name: service.name, path },
  ])
  return service
}
