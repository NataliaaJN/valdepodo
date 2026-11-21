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
  /** Perfil ampliado (solo si la persona ha aportado su texto): al tenerlo se pinta como capítulo propio. */
  profile?: TeamProfileData
  /** Retrato 4:5 en /public/images/team/. `null` = fotografía pendiente. */
  photo: { src: string; alt: string } | null
}

export interface TeamProfileData {
  /** Titular corto bajo el nombre. */
  lead: string
  /** Formación y trayectoria, en orden cronológico. `when` es opcional. */
  path: readonly { when?: string; title: string; place: string }[]
  /** Áreas de interés. */
  interests: readonly string[]
  /** Qué hace en consulta. */
  practice: readonly string[]
  /** Su forma de trabajar: rasgo destacado y texto. */
  approach: { trait: string; text: string }
}

const ROLE = 'Copropietaria | Podóloga'

export const team: readonly TeamMember[] = [
  {
    id: 'paula-vigara',
    name: 'Paula Vigara Aranda',
    role: ROLE,
    bio: null,
    specialties: [],
    license: null,
    profile: {
      lead: 'Pie diabético, quiropodología y biomecánica.',
      path: [
        { when: '2022', title: 'Graduada en Podología', place: 'Universidad Complutense de Madrid' },
        {
          when: 'Enero 2023',
          title: 'Podóloga Interna Residente (PIR)',
          place: 'Clínica Universitaria de Podología de la Complutense',
        },
        { title: 'Máster en Pie Diabético', place: 'Universidad Complutense de Madrid' },
        {
          title: 'Máster en Investigación en Cuidados de Salud',
          place: 'Universidad Complutense de Madrid',
        },
      ],
      interests: ['Pie diabético', 'Quiropodología', 'Biomecánica'],
      practice: [
        'Tratamientos quiropodológicos',
        'Estudios de la pisada',
        'Exploraciones biomecánicas',
        'Prescripción de plantillas',
      ],
      approach: {
        trait: 'Cercanía y empatía',
        text: 'Para Paula es importante escuchar a cada paciente, transmitir confianza y encontrar la mejor solución para cada problema, teniendo siempre en cuenta sus necesidades.',
      },
    },
    linkedin: 'https://es.linkedin.com/in/paula-vigara-aranda-569223253',
    photo: {
      src: '/images/team/paula-vigara.jpg',
      alt: 'Paula Vigara Aranda, copropietaria y podóloga',
    },
  },
  {
    id: 'valerie-savignano',
    name: 'Valerie Savignano Gutiérrez',
    role: ROLE,
    bio: null,
    specialties: [],
    license: null,
    linkedin: 'https://es.linkedin.com/in/valerie-savignano-guti%C3%A9rrez-8552b3249',
    photo: {
      src: '/images/team/valerie-savignano.jpg',
      alt: 'Valerie Savignano Gutiérrez, copropietaria y podóloga',
    },
  },
  {
    id: 'recepcion',
    name: pending('Nombre pendiente', 'Nombre de la recepcionista: validar con la clínica'),
    role: pending('Recepcionista', 'Cargo de la recepcionista: validar con la clínica'),
    bio: null,
    specialties: [],
    license: null,
    linkedin: null,
    photo: null,
  },
]
