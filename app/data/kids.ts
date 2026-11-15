/**
 * Podología infantil (spec 04 §4). Textos de la página, sin lenguaje alarmista ni diagnósticos (spec 09 §4).
 * Referencias de enfoque: páginas de podología infantil de otras clínicas, reescritas con voz propia.
 */

export type KidsIllustrationKind = 'gait' | 'arch' | 'toes' | 'shoe'

export interface KidsAssessment {
  title: string
  text: string
  illustration: KidsIllustrationKind
}

export const kids = {
  description:
    'Acompañamos el desarrollo del pie de los más pequeños, desde los primeros pasos hasta la adolescencia.',
  intro:
    'El pie de un niño no es un pie adulto en pequeño: sus huesos, su forma y su manera de apoyar cambian a lo largo del crecimiento. Por eso conviene revisarlo en distintas etapas.',
  /** Qué revisamos en cada valoración. */
  assessments: [
    {
      title: 'Marcha y pisada',
      text: 'Observamos cómo apoya el pie al estar de pie y al caminar, y cómo reparte el peso en cada paso.',
      illustration: 'gait',
    },
    {
      title: 'Arco plantar',
      text: 'Revisamos su forma y cómo evoluciona con el crecimiento: un pie plano es normal hasta cierta edad.',
      illustration: 'arch',
    },
    {
      title: 'Dedos y uñas',
      text: 'Comprobamos la posición de los dedos y el estado de las uñas y de la piel.',
      illustration: 'toes',
    },
    {
      title: 'Calzado',
      text: 'Miramos el desgaste de sus zapatos, que dice mucho de cómo pisa.',
      illustration: 'shoe',
    },
  ] as readonly KidsAssessment[],
  /** Nota bajo las valoraciones. */
  assessmentNote: 'Si hace falta, completamos la valoración con un estudio biomecánico de la pisada.',
  /** Motivos habituales de consulta (lista editorial, sin lenguaje alarmista). */
  consultTitle: 'Cuándo conviene consultar',
  consult: [
    {
      title: 'Caminar con las puntas hacia dentro',
      text: 'Si los pies se le giran hacia dentro al andar o al correr, miramos cómo se colocan la pierna y el pie.',
    },
    {
      title: 'Caminar de puntillas',
      text: 'Es habitual al empezar a andar; si se mantiene pasado un tiempo, merece una valoración.',
    },
    {
      title: 'Tropiezos y caídas frecuentes',
      text: 'Tropezar a menudo o caerse más que otros niños de su edad puede tener relación con la forma de pisar.',
    },
    {
      title: 'Dolor en pies, rodillas o piernas',
      text: 'Si se queja con frecuencia, sobre todo tras jugar o hacer deporte, vale la pena revisar su pisada.',
    },
    {
      title: 'Pie plano o arco muy marcado',
      text: 'Ver cómo evoluciona el arco nos ayuda a saber si basta con observar o conviene actuar.',
    },
    {
      title: 'Uñas y piel',
      text: 'Uñas encarnadas, verrugas, picor o heridas entre los dedos se tratan mejor si se miran pronto.',
    },
  ] as readonly { title: string; text: string }[],
}
