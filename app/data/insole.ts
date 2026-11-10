/**
 * Contenido de la plantilla conceptual (spec 04 §2.2-2.3, spec 08 §4, spec 09).
 * - Etiquetas de capa GENÉRICAS (definidas en la especificación). No se nombran materiales, durezas,
 *   propiedades biomecánicas ni procesos de fabricación salvo que la clínica los confirme.
 * - Los ids coinciden con `tools/blender/config/insole.json` (`layer_<id>` en el GLB).
 * - Los pasos de las fibras son una METÁFORA visual de construcción, no un proceso de fabricación.
 */
import { pending, type Maybe } from '#shared/utils/pending'

export interface InsoleLayerContent {
  id: 'top' | 'middle' | 'base'
  number: string
  label: string
  /** Para qué sirve la capa: solo si la clínica lo confirma. */
  description: Maybe<string> | null
}

/** De arriba abajo, como se leen en la explosión. */
export const insoleLayers: readonly InsoleLayerContent[] = [
  {
    id: 'top',
    number: '01',
    label: 'Capa superior',
    description: pending(
      '[Función de la capa pendiente de validar]',
      'Solo si la clínica confirma qué aporta la capa',
    ),
  },
  {
    id: 'middle',
    number: '02',
    label: 'Capa intermedia',
    description: pending(
      '[Función de la capa pendiente de validar]',
      'Solo si la clínica confirma qué aporta la capa',
    ),
  },
  {
    id: 'base',
    number: '03',
    label: 'Base',
    description: pending(
      '[Función de la capa pendiente de validar]',
      'Solo si la clínica confirma qué aporta la capa',
    ),
  },
]

export interface FiberStep {
  number: string
  title: string
  text: Maybe<string>
  /** Tramo de `fiberProgress` que ilustra (spec 08 §4.3). */
  range: readonly [number, number]
}

const METAPHOR =
  'Validar con la clínica: si su proceso real no encaja con la metáfora de fibras, se adapta o se elimina'

export const fiberSteps: readonly FiberStep[] = [
  {
    number: '01',
    title: 'Fibras dispersas',
    text: pending('Todo empieza con piezas sueltas, sin forma.', METAPHOR),
    range: [0, 0.2],
  },
  {
    number: '02',
    title: 'Agrupación',
    text: pending('Las piezas se reúnen siguiendo la forma de tu pie.', METAPHOR),
    range: [0.2, 0.45],
  },
  {
    number: '03',
    title: 'Superficie',
    text: pending('Se ordenan hasta crear una superficie continua.', METAPHOR),
    range: [0.45, 0.65],
  },
  {
    number: '04',
    title: 'Volumen',
    text: pending('La superficie gana cuerpo, capa a capa.', METAPHOR),
    range: [0.65, 0.85],
  },
  {
    number: '05',
    title: 'Plantilla',
    text: pending('El resultado: una plantilla pensada para ti.', METAPHOR),
    range: [0.85, 1],
  },
]

/** Rótulo obligatorio de la experiencia (spec 04 §2.2). */
export const CONCEPTUAL_LABEL = 'Representación conceptual'

/**
 * Proceso de personalización (spec 04 §2.4). Nombres de la especificación; descripciones en `pending()`.
 * El paso 01 enlaza al Estudio biomecánico.
 */
export interface ProcessStep {
  title: string
  text: Maybe<string>
  link?: { label: string; to: string }
}

const PROCESS_NOTE = 'Paso del proceso de personalización (spec 04 §2.4): validar con la clínica'

export const insoleProcess: readonly ProcessStep[] = [
  {
    title: 'Valoración del pie',
    text: pending('Empezamos por estudiar tu pie y tu forma de caminar.', PROCESS_NOTE),
    link: { label: 'Ver el estudio biomecánico', to: '/servicios/estudio-biomecanico' },
  },
  {
    title: 'Análisis de necesidades',
    text: pending('Valoramos tu actividad diaria, tu calzado y tus molestias.', PROCESS_NOTE),
  },
  {
    title: 'Diseño y adaptación',
    text: pending('Diseñamos la plantilla a partir de los datos de la valoración.', PROCESS_NOTE),
  },
  {
    title: 'Entrega y seguimiento',
    text: pending('Te entregamos las plantillas y revisamos cómo te adaptas a ellas.', PROCESS_NOTE),
  },
]
