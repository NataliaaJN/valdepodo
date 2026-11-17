/**
 * Valores de la Home (spec 03 §3). Títulos literales de la especificación (spec 09 §5), salvo la cifra de
 * años, que se calcula desde `site.foundedYear`. Textos en `pending()` hasta que la clínica los valide.
 */
import { pending, type Maybe } from '#shared/utils/pending'

export type ValueIcon = 'years' | 'care' | 'technology' | 'location'

export interface ClinicValue {
  id: ValueIcon
  /** `{years}` se sustituye por los años desde la apertura. */
  title: string
  text: Maybe<string>
}

const NOTE = 'Texto del valor (spec 03 §3): validar con la clínica'

export const values: readonly ClinicValue[] = [
  {
    id: 'years',
    title: '{years} años de experiencia',
    text: pending('Trayectoria y compromiso con la salud de los pies.', NOTE),
  },
  { id: 'care', title: 'Trato cercano', text: pending('Atención personalizada y escucha activa.', NOTE) },
  {
    id: 'technology',
    title: 'Tecnología y calidad',
    text: pending('Medios y materiales adecuados para la atención podológica.', NOTE),
  },
  {
    id: 'location',
    title: 'Ubicación y accesibilidad',
    text: pending('Facilidad de acceso y atención adaptada a los pacientes.', NOTE),
  },
]
