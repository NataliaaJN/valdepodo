/**
 * SEO común de las páginas de servicio (spec 04): título, descripción, `MedicalProcedure` y breadcrumbs.
 */
import { resolveValue } from '#shared/utils/pending'
import { getService, servicePath } from '~/features/services/data/services'

export function useServicePage(slug: string) {
  const service = getService(slug)
  const path = servicePath(slug)
  const description = resolveValue(service.description)

  usePageSeo({ title: service.name, description, path })
  useServiceSchema({ name: service.name, description, path })
  useBreadcrumbSchema([
    { name: 'Inicio', path: '/' },
    { name: 'Servicios', path: '/servicios' },
    { name: service.name, path },
  ])
  return service
}
