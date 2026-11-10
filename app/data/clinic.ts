/**
 * La clínica (spec 05 §1, §3-5). Fotos e hitos solo reales: mientras falten, placeholders ilustrados
 * marcados como pendientes y la línea temporal no se renderiza.
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

export const clinic = {
  heroText: pending(
    'Entendemos la podología como una forma de cuidar a las personas: escuchar, explicar y acompañar en cada paso.',
    NOTE,
  ) as Maybe<string>,
  /** Mosaico: la primera es la principal. */
  photos: [
    { src: null, alt: pending('Recepción de la clínica', PHOTO), caption: pending('Recepción', PHOTO) },
    { src: null, alt: pending('Sala de consulta', PHOTO), caption: pending('Consulta', PHOTO) },
    {
      src: null,
      alt: pending('Zona de estudio biomecánico', PHOTO),
      caption: pending('Estudio biomecánico', PHOTO),
    },
    { src: null, alt: pending('Detalle del instrumental', PHOTO), caption: pending('Detalle', PHOTO) },
    { src: null, alt: pending('Detalle de las plantillas', PHOTO), caption: pending('Plantillas', PHOTO) },
    { src: null, alt: pending('Fachada de la clínica', PHOTO), caption: pending('Fachada', PHOTO) },
  ] as readonly ClinicPhoto[],
  experienceText: pending(
    '[Trayectoria de la clínica pendiente de redactar con la clínica]',
    'Texto de trayectoria (spec 05 §4)',
  ) as Maybe<string>,
  /** Hitos reales. Vacío → la línea temporal no se renderiza (spec 05 §4). */
  milestones: [] as readonly { year: number; text: string }[],
  philosophy: [
    { title: 'Escuchar', text: pending('Empezamos por entender qué te pasa y qué necesitas.', NOTE) },
    { title: 'Analizar', text: pending('Estudiamos tu pie y tu forma de moverte.', NOTE) },
    { title: 'Tratar', text: pending('Te proponemos el tratamiento adecuado y te lo explicamos.', NOTE) },
    { title: 'Prevenir', text: pending('Te damos pautas para que las molestias no vuelvan.', NOTE) },
  ] as readonly { title: string; text: Maybe<string> }[],
}
