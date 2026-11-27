/**
 * Equipo (spec 05 §2): datos confirmados por la clínica. **No se deduce el equipo de las reseñas** (research §3.2).
 * Fotos reales; LinkedIn autorizado por cada profesional.
 */
import type { Maybe } from '#shared/utils/pending'

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
  /** Titular: una frase que presenta a la persona. */
  lead: Maybe<string>
  /** Cifra destacada (opcional). */
  stat?: { value: string; label: string }
  /** Formación y trayectoria en orden cronológico (opcional). `when` y `place` son opcionales. */
  path?: readonly { when?: string; title: Maybe<string>; place?: Maybe<string> }[]
  /** Áreas de interés (opcional). */
  interests?: readonly Maybe<string>[]
  /** Qué hace en la clínica, con su título de bloque (opcional). */
  practice?: { title: string; items: readonly Maybe<string>[] }
  /** Su forma de trabajar: rasgo destacado y texto. */
  approach: { trait: Maybe<string>; text: Maybe<string> }
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
      practice: {
        title: 'En consulta',
        items: [
          'Tratamientos quiropodológicos',
          'Estudios de la pisada',
          'Exploraciones biomecánicas',
          'Prescripción de plantillas',
        ],
      },
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
    profile: {
      lead: 'Quiropodia, exploración biomecánica y cirugía menor del pie.',
      path: [
        { when: 'Junio 2022', title: 'Graduada en Podología', place: 'Universidad Complutense de Madrid' },
        { when: 'Abril 2023', title: 'Inicio de su trayectoria profesional como podóloga' },
        { title: 'Experto en Podología Deportiva y Biomecánica', place: 'Centro Universitario La Salle' },
        {
          when: 'En curso',
          title: 'Experto en Podología Médico-Quirúrgica',
          place: 'Universidad Complutense de Madrid',
        },
      ],
      interests: ['Quiropodia', 'Exploración biomecánica', 'Cirugía menor del pie'],
      approach: {
        trait: 'Cercanía y paciencia',
        text: 'Valerie se considera una persona cercana, paciente, cuidadosa y amable. Lo que más disfruta de su trabajo es cuidar de los pacientes y contribuir a mejorar su calidad de vida: cada consulta es una oportunidad para ayudar, acompañar y ofrecer el mejor cuidado posible.',
      },
    },
    linkedin: 'https://es.linkedin.com/in/valerie-savignano-guti%C3%A9rrez-8552b3249',
    photo: {
      src: '/images/team/valerie-savignano.jpg',
      alt: 'Valerie Savignano Gutiérrez, copropietaria y podóloga',
    },
  },
  {
    id: 'ana',
    name: 'Ana',
    role: 'Recepción y administración',
    bio: null,
    specialties: [],
    license: null,
    profile: {
      lead: 'La persona que te recibe cuando llegas a Valdepodo y la que está al otro lado del teléfono cuando nos necesitas.',
      stat: { value: '+40', label: 'años de experiencia en administración y atención al paciente' },
      practice: {
        title: 'En Valdepodo se encarga de',
        items: ['Recepción', 'Gestión de citas', 'Atención telefónica', 'Tareas administrativas'],
      },
      approach: {
        trait: 'Atenta, amable, empática y cercana',
        text: 'Su cariño al recibir a cada paciente y la templanza que aporta al equipo hacen que sea una pieza fundamental para nosotras.',
      },
    },
    linkedin: null,
    photo: { src: '/images/team/ana.jpg', alt: 'Ana, recepción y administración de Valdepodo' },
  },
]
