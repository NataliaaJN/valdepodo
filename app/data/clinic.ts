/**
 * La clínica y el equipo (spec 05, página única `/conocenos`). Fotos e hitos solo reales: mientras falten,
 * placeholders ilustrados marcados como pendientes y la línea temporal no se renderiza.
 */
import { pending, type Maybe } from '#shared/utils/pending'

export interface ClinicPhoto {
  /** Ruta en /public/images/clinic/. `null` = fotografía pendiente. */
  src: string | null
  alt: Maybe<string>
  caption: Maybe<string>
}

const PHOTO = 'Fotografía de la clínica (spec 05 §3): la aporta la clínica, con permisos'

/** Textos compartidos entre la filosofía de la Home (4 verbos) y el método de la clínica (5 fases). */
const LISTEN = 'Empezamos por entender qué te pasa y qué necesitas.'
const ANALYSE = 'Estudiamos tu pie y tu forma de moverte.'
const TREAT = 'Te proponemos el tratamiento adecuado y te lo explicamos.'

export const clinic = {
  /** Fotografía de equipo del hero (horizontal, ≥ 1600 px). `src: null` = pendiente. */
  teamPhoto: {
    src: '/images/clinic/fachada-equipo.jpg' as string | null,
    alt: 'Paula y Valerie, el equipo de Valdepodo, ante la fachada de la clínica',
  },
  /** Texto de apoyo de la sección «Un espacio pensado para cuidar de ti». */
  spaceText: pending(
    'Un lugar cálido, limpio y tranquilo, cuidado en cada detalle, para atenderte sin prisas.',
    'Texto de Conócenos (spec 05): validar con la clínica',
  ) as Maybe<string>,
  /** Composición editorial: la primera es la principal (4 imágenes, no una galería). */
  photos: [
    { src: null, alt: pending('Recepción de la clínica', PHOTO), caption: pending('Recepción', PHOTO) },
    { src: null, alt: pending('Sala de consulta', PHOTO), caption: pending('Consulta', PHOTO) },
    {
      src: null,
      alt: pending('Zona de estudio biomecánico', PHOTO),
      caption: pending('Estudio biomecánico', PHOTO),
    },
    { src: null, alt: pending('Detalle del instrumental', PHOTO), caption: pending('Detalle', PHOTO) },
  ] as readonly ClinicPhoto[],
  /** Hitos reales. Vacío → la línea temporal no se renderiza (spec 05 §4). */
  milestones: [] as readonly { year: number; text: string }[],
  /** Los cuatro verbos de la Home («Cuatro verbos, un solo paso»). */
  philosophy: [
    { title: 'Escuchar', text: LISTEN },
    { title: 'Analizar', text: ANALYSE },
    { title: 'Tratar', text: TREAT },
    { title: 'Prevenir', text: 'Te damos pautas para que las molestias no vuelvan.' },
  ] as readonly { title: string; text: Maybe<string> }[],
  /** Método de la clínica en cinco fases (línea de tiempo de `/conocenos`). */
  method: [
    { title: 'Escuchar', text: LISTEN },
    { title: 'Analizar', text: ANALYSE },
    {
      title: 'Valorar',
      text: 'Valoramos juntos los resultados y te explicamos qué opciones tienes.',
    },
    { title: 'Tratar', text: TREAT },
    {
      title: 'Acompañar',
      text: 'Seguimos a tu lado y te damos pautas para que las molestias no vuelvan.',
    },
  ] as readonly { title: string; text: Maybe<string> }[],
}
