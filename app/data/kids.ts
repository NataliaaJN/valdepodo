/**
 * Podología infantil (spec 04 §4). Todo el texto clínico en `pending()`; la línea temporal solo admite hitos
 * validados (vacía → no se renderiza). Sin lenguaje alarmista ni diagnósticos (spec 09 §4).
 */
import { pending, type Maybe } from '#shared/utils/pending'

const NOTE = 'Contenido de podología infantil (spec 04 §4): validar con la clínica'

export const kids = {
  description: pending(
    'Acompañamos el desarrollo del pie de los más pequeños, desde los primeros pasos hasta la adolescencia.',
    NOTE,
  ) as Maybe<string>,
  intro: pending(
    'El pie de un niño no es un pie adulto en pequeño: sus huesos, su forma y su manera de apoyar cambian a lo largo del crecimiento. Por eso conviene revisarlo en distintas etapas.',
    NOTE,
  ) as Maybe<string>,
  /** Qué podemos valorar (lista con iconos). */
  assessments: [
    pending('Cómo apoya el pie al estar de pie y al caminar.', NOTE),
    pending('La forma y la evolución del arco plantar.', NOTE),
    pending('La posición de los dedos y las uñas.', NOTE),
    pending('El desgaste del calzado.', NOTE),
  ] as readonly Maybe<string>[],
  /** Hitos del desarrollo por edades: solo validados. Vacío → la sección no se muestra. */
  milestones: [] as readonly { age: string; text: string }[],
  gait: pending(
    'Observamos su forma de caminar para detectar si algo puede mejorar con el seguimiento adecuado.',
    NOTE,
  ) as Maybe<string>,
  /** Alteraciones de la marcha (lista editorial, sin lenguaje alarmista). */
  gaitIssues: [
    {
      title: 'Caminar con las puntas hacia dentro',
      text: pending('[Descripción pendiente de validar]', NOTE),
    },
    { title: 'Caminar de puntillas', text: pending('[Descripción pendiente de validar]', NOTE) },
    { title: 'Tropiezos frecuentes', text: pending('[Descripción pendiente de validar]', NOTE) },
  ] as readonly { title: string; text: Maybe<string> }[],
  followUp: [
    { title: 'Primera valoración', text: pending('Conocemos al niño o niña y revisamos su pie.', NOTE) },
    {
      title: 'Seguimiento',
      text: pending('Revisamos su evolución en las etapas clave del crecimiento.', NOTE),
    },
    { title: 'Prevención', text: pending('Os damos pautas de calzado y actividad para el día a día.', NOTE) },
  ] as readonly { title: string; text: Maybe<string> }[],
  advice: pending(
    '[Consejo sobre la frecuencia de revisión pendiente de validar]',
    'Consejo de revisión (spec 04 §4, sección 7): lo define la clínica',
  ) as Maybe<string>,
}
