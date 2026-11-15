/**
 * Equipo (spec 05 §2): datos confirmados por la clínica. **No se deduce el equipo de las reseñas** (research §3.2).
 * Fotos reales; LinkedIn autorizado por cada profesional.
 */
import { pending, type Maybe } from '#shared/utils/pending'

export interface TeamMember {
  id: string
  name: Maybe<string>
  role: Maybe<string>
  bio: Maybe<string> | null
  specialties: readonly Maybe<string>[]
  /** Nº de colegiada: solo si la clínica quiere mostrarlo. */
  license: Maybe<string> | null
  /** LinkedIn: solo si la persona lo autoriza. */
  linkedin: Maybe<string> | null
  /** Retrato 4:5 en /public/images/team/. `null` = fotografía pendiente. */
  photo: { src: string; alt: string } | null
}

const ROLE = 'Copropietaria y Podóloga'
const BIO = 'Presentación breve de la persona (2 líneas): la redacta la clínica'

export const team: readonly TeamMember[] = [
  {
    id: 'paula-vigara',
    name: 'Paula Vigara Aranda',
    role: ROLE,
    bio: pending('Presentación breve pendiente.', BIO),
    specialties: [],
    license: null,
    linkedin: 'https://es.linkedin.com/in/paula-vigara-aranda-569223253',
    photo: {
      src: '/images/team/valerie-savignano.jpg',
      alt: 'Paula Vigara Aranda, copropietaria y podóloga',
    },
  },
  {
    id: 'valerie-savignano',
    name: 'Valerie Savignano Gutiérrez',
    role: ROLE,
    bio: pending('Presentación breve pendiente.', BIO),
    specialties: [],
    license: null,
    linkedin: 'https://es.linkedin.com/in/valerie-savignano-guti%C3%A9rrez-8552b3249',
    photo: {
      src: '/images/team/paula-vigara.jpg',
      alt: 'Valerie Savignano Gutiérrez, copropietaria y podóloga',
    },
  },
  {
    id: 'recepcion',
    name: pending('Nombre pendiente', 'Nombre de la recepcionista: validar con la clínica'),
    role: pending('Recepcionista', 'Cargo de la recepcionista: validar con la clínica'),
    bio: pending('Presentación breve pendiente.', BIO),
    specialties: [],
    license: null,
    linkedin: null,
    photo: null,
  },
]
