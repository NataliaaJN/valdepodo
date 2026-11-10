/**
 * Equipo (spec 05 §2). Sin datos de la clínica todavía: nombres, cargos y fotos son marcadores
 * inequívocos (spec 09 §2). **No se deduce el equipo de las reseñas** (research §3.2).
 * Fotos: nunca stock; mientras falten, ilustración de marca con "Fotografía pendiente".
 */
import { pending, type Maybe } from '#shared/utils/pending'

export interface TeamMember {
  id: string
  name: Maybe<string>
  role: Maybe<string>
  bio: Maybe<string>
  specialties: readonly Maybe<string>[]
  /** Nº de colegiada: solo si la clínica quiere mostrarlo. */
  license: Maybe<string> | null
  /** LinkedIn: solo si la persona lo autoriza. */
  linkedin: Maybe<string> | null
  /** Retrato 4:5 en /public/images/team/. `null` = fotografía pendiente. */
  photo: { src: string; alt: string } | null
}

const NOTE = 'Dato del equipo (spec 05 §2): lo facilita la clínica'

export const team: readonly TeamMember[] = [
  {
    id: 'profesional-1',
    name: pending('Nombre Apellido', NOTE),
    role: pending('[Cargo pendiente]', NOTE),
    bio: pending('[Breve descripción profesional pendiente de la clínica]', NOTE),
    specialties: [pending('[Especialidad]', NOTE), pending('[Especialidad]', NOTE)],
    license: pending('[Nº de colegiada]', 'Solo si la clínica quiere mostrarlo'),
    linkedin: null,
    photo: null,
  },
  {
    id: 'profesional-2',
    name: pending('Nombre Apellido', NOTE),
    role: pending('[Cargo pendiente]', NOTE),
    bio: pending('[Breve descripción profesional pendiente de la clínica]', NOTE),
    specialties: [pending('[Especialidad]', NOTE), pending('[Especialidad]', NOTE)],
    license: pending('[Nº de colegiada]', 'Solo si la clínica quiere mostrarlo'),
    linkedin: null,
    photo: null,
  },
]
