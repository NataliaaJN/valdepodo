/**
 * Tratamientos de podología general (spec 04 §3). Nombres y subtítulos de las notas iniciales de la
 * especificación; descripciones en `pending()`. Sin promesas de resultados ni diagnósticos (spec 09 §4).
 */
import { pending, type Maybe } from '#shared/utils/pending'

export type TreatmentIllustration = 'ingrown' | 'wart' | 'callus' | 'corn'

export interface Treatment {
  number: string
  name: string
  subtitle: Maybe<string>
  description: Maybe<string>
  illustration: TreatmentIllustration
}

const NOTE = 'Descripción del tratamiento (spec 04 §3): validar con la clínica'
const SUB = 'Subtítulo de las notas iniciales (spec 04 §3): validar'

export const treatments: readonly Treatment[] = [
  {
    number: '01',
    name: 'Uñas encarnadas',
    subtitle: pending('Tratamiento y prevención', SUB),
    description: pending(
      'Aliviamos la molestia de la uña que se clava en la piel y te explicamos cómo evitar que vuelva a ocurrir.',
      NOTE,
    ),
    illustration: 'ingrown',
  },
  {
    number: '02',
    name: 'Papilomas y verrugas',
    subtitle: pending('Eliminación segura', SUB),
    description: pending(
      'Valoramos la lesión y te proponemos el tratamiento más adecuado para eliminarla.',
      NOTE,
    ),
    illustration: 'wart',
  },
  {
    number: '03',
    name: 'Durezas y callosidades',
    subtitle: pending('Eliminación y cuidado', SUB),
    description: pending(
      'Retiramos las zonas de piel engrosada y buscamos el origen de la presión que las provoca.',
      NOTE,
    ),
    illustration: 'callus',
  },
  {
    number: '04',
    name: 'Ojo de gallo',
    subtitle: pending('[Subtítulo pendiente]', 'Subtítulo del tratamiento (spec 04 §3)'),
    description: pending('Tratamos este tipo de callo y aliviamos la presión entre los dedos.', NOTE),
    illustration: 'corn',
  },
]
