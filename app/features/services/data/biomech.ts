/**
 * Contenido y estados visuales del Estudio biomecánico (spec 04 §1.3-1.4, spec 09).
 * - Nombres de las fases: definidos en la especificación (no son `pending`).
 * - Textos explicativos: borradores neutros envueltos en `pending()` hasta que la clínica los valide.
 * - Estados del mapa: ilustrativos. No son mediciones ni patrones clínicos de referencia.
 */
import { pending, type Maybe } from '#shared/utils/pending'
import { defineState, type PressureState } from '~/utils/pressure'

/* ---------------------------------------------------------------------------------------------- */
/* Estados del mapa de presión (intensidad 0..1 por foco)                                          */
/* ---------------------------------------------------------------------------------------------- */

export const pressureStates = {
  /** Sin carga: punto de partida de las animaciones de "encendido". */
  idle: defineState({ heel: 0, midfoot: 0, met1: 0, met23: 0, met45: 0, hallux: 0, toes: 0 }),

  /** Bipedestación: carga repartida entre talón y antepié. */
  standing: defineState({
    heel: 0.95,
    midfoot: 0.32,
    met1: 0.62,
    met23: 0.78,
    met45: 0.55,
    hallux: 0.42,
    toes: 0.2,
  }),

  /** Variante para la comparativa izquierda/derecha (ejemplo de asimetría, sin valor clínico). */
  standingAlt: defineState(
    { heel: 0.82, midfoot: 0.22, met1: 0.82, met23: 0.86, met45: 0.38, hallux: 0.56, toes: 0.14 },
    { heel: { x: 50 }, met1: { r: 27 }, midfoot: { r: 19 } },
  ),

  /** Marcha · contacto de talón. */
  heelStrike: defineState(
    { heel: 1, midfoot: 0.08, met1: 0, met23: 0, met45: 0, hallux: 0, toes: 0 },
    { heel: { x: 57, y: 222, r: 32 } },
  ),

  /** Marcha · apoyo medio. */
  midstance: defineState({
    heel: 0.62,
    midfoot: 0.55,
    met1: 0.42,
    met23: 0.62,
    met45: 0.6,
    hallux: 0.12,
    toes: 0.08,
  }),

  /** Marcha · despegue. */
  toeOff: defineState(
    { heel: 0, midfoot: 0.04, met1: 0.9, met23: 0.95, met45: 0.42, hallux: 1, toes: 0.5 },
    { hallux: { r: 19 }, met1: { y: 86 } },
  ),

  /** Carrera: más carga en el antepié. */
  runForefoot: defineState(
    { heel: 0.22, midfoot: 0.2, met1: 0.92, met23: 1, met45: 0.78, hallux: 0.82, toes: 0.46 },
    { met23: { r: 27 }, met1: { r: 26 }, heel: { r: 28 } },
  ),
} satisfies Record<string, PressureState>

export type PressureStateId = keyof typeof pressureStates

/** Ciclo de apoyo usado en la marcha y la carrera (contacto → apoyo medio → despegue). */
export const gaitCycle: readonly PressureStateId[] = ['heelStrike', 'midstance', 'toeOff']
export const runCycle: readonly PressureStateId[] = ['midstance', 'runForefoot', 'toeOff']

/* ---------------------------------------------------------------------------------------------- */
/* Fases de la secuencia                                                                           */
/* ---------------------------------------------------------------------------------------------- */

/** Composición del visual de cada fase en `BiomechStage`. */
export type BiomechScene = 'joints' | 'static' | 'gait' | 'run' | 'compare' | 'insole'

export interface BiomechPhase {
  id: string
  /** Numeral visible ("01"…"06"). */
  number: string
  title: string
  text: Maybe<string>
  scene: BiomechScene
  /** Enlace opcional al final del bloque (fase 06 → Plantillas). */
  link?: { label: string; to: string }
}

const VALIDATE = 'Validar con la clínica (spec 04 §1.3): no afirmar que todos los estudios incluyen esta fase'

export const biomechPhases: readonly BiomechPhase[] = [
  {
    id: 'articular',
    number: '01',
    title: 'Análisis articular y muscular',
    text: pending(
      'Valoramos cómo se mueven las articulaciones del pie y del tobillo y el estado de la musculatura que las acompaña.',
      VALIDATE,
    ),
    scene: 'joints',
  },
  {
    id: 'estatico',
    number: '02',
    title: 'Análisis plantar estático',
    text: pending(
      'Observamos cómo se reparte el apoyo de los dos pies cuando estás de pie, sin moverte.',
      VALIDATE,
    ),
    scene: 'static',
  },
  {
    id: 'marcha',
    number: '03',
    title: 'Análisis de la marcha',
    text: pending(
      'Estudiamos cada paso: cómo contacta el talón, cómo avanza el apoyo por la planta y cómo despega el pie.',
      VALIDATE,
    ),
    scene: 'gait',
  },
  {
    id: 'carrera',
    number: '04',
    title: 'Análisis de carrera',
    text: pending(
      'Si corres, analizamos también la pisada a mayor velocidad, cuando el apoyo y los tiempos cambian.',
      VALIDATE,
    ),
    scene: 'run',
  },
  {
    id: 'resultados',
    number: '05',
    title: 'Valoración de resultados',
    text: pending(
      'Comparamos el pie izquierdo y el derecho y te explicamos lo que hemos observado, con calma y sin tecnicismos.',
      VALIDATE,
    ),
    scene: 'compare',
  },
  {
    id: 'tratamiento',
    number: '06',
    title: 'Propuesta de tratamiento',
    text: pending(
      'Con toda la información te proponemos el tratamiento más adecuado, que puede incluir plantillas personalizadas.',
      VALIDATE,
    ),
    scene: 'insole',
    link: { label: 'Ver plantillas personalizadas', to: '/servicios/plantillas-personalizadas' },
  },
]

/** Rótulo obligatorio junto a cualquier mapa de presión (spec 08 §3). */
export const ILLUSTRATIVE_LABEL = 'Visualización ilustrativa'
