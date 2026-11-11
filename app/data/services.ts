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
  /** Descripción del índice de servicios y de la meta description (spec 04 §0). */
  description: Maybe<string>
  /** "Te ayuda si…" (spec 04 §0): 2-4 necesidades. */
  needs: readonly Maybe<string>[]
  graphic: ServiceGraphic
  /** Destacado en la Home (spec 03 §2). */
  featured: boolean
  /** Servicios relacionados ("También te puede interesar"). */
  related: readonly string[]
}

const VALIDATE = 'Validar con la clínica'
const NEEDS = '"Te ayuda si…" del servicio (spec 04 §0): validar con la clínica'

export const services: readonly Service[] = [
  {
    slug: 'estudio-biomecanico',
    number: '01',
    name: 'Estudio biomecánico',
    summary: pending('Analizamos cómo apoyas y cómo te mueves para entender tu pisada.', VALIDATE),
    description: pending(
      'Una valoración de cómo apoyas el pie en reposo, al caminar y al correr, para entender el origen de tus molestias.',
      VALIDATE,
    ),
    needs: [
      pending('Tienes molestias en los pies, rodillas o espalda al caminar o correr.', NEEDS),
      pending('Practicas deporte y quieres conocer tu pisada.', NEEDS),
      pending('Te han recomendado plantillas y quieres una valoración previa.', NEEDS),
    ],
    graphic: 'pressure',
    featured: true,
    related: ['plantillas-personalizadas', 'podologia-infantil'],
  },
  {
    slug: 'plantillas-personalizadas',
    number: '02',
    name: 'Plantillas personalizadas',
    summary: pending('Plantillas diseñadas a partir de la valoración de tu pie.', VALIDATE),
    description: pending(
      'Plantillas hechas a medida a partir del estudio de tu pie y de cómo te mueves, con seguimiento posterior.',
      VALIDATE,
    ),
    needs: [
      pending('El estudio biomecánico indica que necesitas un soporte personalizado.', NEEDS),
      pending('Notas cansancio o dolor en los pies tras estar de pie o caminar.', NEEDS),
      pending('Tus plantillas actuales ya no se adaptan a tu pie.', NEEDS),
    ],
    graphic: 'insole',
    featured: true,
    related: ['estudio-biomecanico', 'podologia-general'],
  },
  {
    slug: 'podologia-general',
    number: '03',
    name: 'Podología general',
    summary: pending('Cuidado de uñas y piel del pie, y tratamiento de molestias frecuentes.', VALIDATE),
    description: pending(
      'Tratamiento de las molestias más frecuentes de uñas y piel: uñas encarnadas, papilomas, durezas y ojo de gallo.',
      VALIDATE,
    ),
    needs: [
      pending('Tienes una uña que se clava o te molesta.', NEEDS),
      pending('Te han salido durezas, callosidades o un ojo de gallo.', NEEDS),
      pending('Tienes una verruga o papiloma en la planta del pie.', NEEDS),
    ],
    graphic: 'nail',
    featured: true,
    related: ['pie-diabetico', 'estudio-biomecanico'],
  },
  {
    slug: 'podologia-infantil',
    number: '04',
    name: 'Podología infantil',
    summary: pending('Seguimiento del pie durante el crecimiento.', VALIDATE),
    description: pending(
      'Valoramos cómo se desarrolla el pie y la forma de caminar durante la infancia, con un seguimiento adaptado a cada edad.',
      VALIDATE,
    ),
    needs: [
      pending('Tu hijo o hija camina de forma diferente o se cae con frecuencia.', NEEDS),
      pending('Notas un desgaste irregular en su calzado.', NEEDS),
      pending('Quieres una revisión de su pie durante el crecimiento.', NEEDS),
    ],
    graphic: 'growth',
    featured: false,
    related: ['estudio-biomecanico', 'plantillas-personalizadas'],
  },
  {
    slug: 'pie-diabetico',
    number: '05',
    name: 'Pie diabético',
    summary: pending('Revisión y cuidado preventivo del pie en personas con diabetes.', VALIDATE),
    description: pending(
      'Revisiones periódicas y cuidados podológicos para prevenir complicaciones en el pie de las personas con diabetes.',
      VALIDATE,
    ),
    needs: [
      pending('Tienes diabetes y quieres revisar tus pies de forma periódica.', NEEDS),
      pending('Necesitas ayuda con el cuidado de uñas y piel.', NEEDS),
    ],
    graphic: 'control',
    featured: false,
    related: ['podologia-general', 'plantillas-personalizadas'],
  },
]

export const servicePath = (slug: string) => `/servicios/${slug}`

export function getService(slug: string): Service {
  const service = services.find((s) => s.slug === slug)
  if (!service) throw new Error(`Servicio desconocido: ${slug}`)
  return service
}

/** Enlace a pedir cita con el motivo preseleccionado (spec 04 §6). */
export const bookingPath = (slug: string) => `/contacto?motivo=${slug}#cita`
