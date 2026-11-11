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
const NOTE = 'Texto de Conócenos (spec 05): validar con la clínica'

/** Textos compartidos entre la filosofía de la Home (4 verbos) y el método de la clínica (5 fases). */
const LISTEN = pending('Empezamos por entender qué te pasa y qué necesitas.', NOTE)
const ANALYSE = pending('Estudiamos tu pie y tu forma de moverte.', NOTE)
const TREAT = pending('Te proponemos el tratamiento adecuado y te lo explicamos.', NOTE)

export const clinic = {
  heroText: pending(
    'Entendemos la podología como una forma de cuidar a las personas: escuchar, explicar y acompañar en cada paso.',
    NOTE,
  ) as Maybe<string>,
  /** Fotografía de equipo del hero (horizontal, ≥ 1600 px). `src: null` = pendiente. */
  teamPhoto: {
    src: null as string | null,
    alt: pending('El equipo de Valdepodo en la clínica', 'Fotografía del equipo: la aporta la clínica'),
  },
  /** Texto de apoyo de la sección «Un espacio pensado para cuidar de ti». */
  spaceText: pending(
    'Un lugar cálido, limpio y tranquilo, cuidado en cada detalle, para atenderte sin prisas.',
    NOTE,
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
  experienceText: pending(
    '[Trayectoria de la clínica pendiente de redactar con la clínica]',
    'Texto de trayectoria (spec 05 §4)',
  ) as Maybe<string>,
  /** Hitos reales. Vacío → la línea temporal no se renderiza (spec 05 §4). */
  milestones: [] as readonly { year: number; text: string }[],
  /** Los cuatro verbos de la Home («Cuatro verbos, un solo paso»). */
  philosophy: [
    { title: 'Escuchar', text: LISTEN },
    { title: 'Analizar', text: ANALYSE },
    { title: 'Tratar', text: TREAT },
    { title: 'Prevenir', text: pending('Te damos pautas para que las molestias no vuelvan.', NOTE) },
  ] as readonly { title: string; text: Maybe<string> }[],
  /** Método de la clínica en cinco fases (línea de tiempo de `/conocenos`). */
  method: [
    { title: 'Escuchar', text: LISTEN },
    { title: 'Analizar', text: ANALYSE },
    {
      title: 'Valorar',
      text: pending('Valoramos juntos los resultados y te explicamos qué opciones tienes.', NOTE),
    },
    { title: 'Tratar', text: TREAT },
    {
      title: 'Acompañar',
      text: pending('Seguimos a tu lado y te damos pautas para que las molestias no vuelvan.', NOTE),
    },
  ] as readonly { title: string; text: Maybe<string> }[],
}
