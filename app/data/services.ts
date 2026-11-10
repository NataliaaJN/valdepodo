/**
 * Servicios (spec 04, spec 09 §1). Los nombres los define la especificación; los resúmenes son borradores
 * neutros en `pending()` hasta que la clínica los valide.
 */
import { pending, type Maybe } from '#shared/utils/pending'

/** Recurso gráfico propio de cada servicio (spec 04 §0). */
export type ServiceGraphic = 'pressure' | 'insole' | 'nail' | 'growth' | 'control'

export interface Service {
  slug: string
  number: string
  name: string
  summary: Maybe<string>
  graphic: ServiceGraphic
  /** Destacado en la Home (spec 03 §2). */
  featured: boolean
}

const VALIDATE = 'Validar con la clínica'

export const services: readonly Service[] = [
  {
    slug: 'estudio-biomecanico',
    number: '01',
    name: 'Estudio biomecánico',
    summary: pending('Analizamos cómo apoyas y cómo te mueves para entender tu pisada.', VALIDATE),
    graphic: 'pressure',
    featured: true,
  },
  {
    slug: 'plantillas-personalizadas',
    number: '02',
    name: 'Plantillas personalizadas',
    summary: pending('Plantillas diseñadas a partir de la valoración de tu pie.', VALIDATE),
    graphic: 'insole',
    featured: true,
  },
  {
    slug: 'podologia-general',
    number: '03',
    name: 'Podología general',
    summary: pending('Cuidado de uñas y piel del pie, y tratamiento de molestias frecuentes.', VALIDATE),
    graphic: 'nail',
    featured: true,
  },
  {
    slug: 'podologia-infantil',
    number: '04',
    name: 'Podología infantil',
    summary: pending('Seguimiento del pie durante el crecimiento.', VALIDATE),
    graphic: 'growth',
    featured: false,
  },
  {
    slug: 'pie-diabetico',
    number: '05',
    name: 'Pie diabético',
    summary: pending('Revisión y cuidado preventivo del pie en personas con diabetes.', VALIDATE),
    graphic: 'control',
    featured: false,
  },
]

export const servicePath = (slug: string) => `/servicios/${slug}`

export function getService(slug: string): Service {
  const service = services.find((s) => s.slug === slug)
  if (!service) throw new Error(`Servicio desconocido: ${slug}`)
  return service
}
