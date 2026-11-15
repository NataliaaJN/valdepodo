/**
 * «El paseo» (Estudio biomecánico): geometría y estados de cada estación del recorrido.
 * Una estación por fase de `biomechPhases` (mismo orden). Los mapas son ilustrativos, no mediciones.
 */
import { gaitCycle, pressureStates, runCycle } from '~/data/biomech'
import type { FootSide, PressureState } from '~/utils/pressure'

export interface WalkFoot {
  side: FootSide
  /** Desplazamiento horizontal respecto al eje del recorrido (unidades del lienzo). */
  dx: number
  /** Giro en grados. */
  rot: number
}

/** Pies de cada estación: 01 y 03-04 un pie que avanza; 02, 05 y 06 los dos pies. */
export const walkFeet: readonly (readonly WalkFoot[])[] = [
  [{ side: 'right', dx: 34, rot: 5 }],
  [
    { side: 'left', dx: -66, rot: -2 },
    { side: 'right', dx: 66, rot: 2 },
  ],
  [{ side: 'left', dx: -34, rot: -6 }],
  [{ side: 'right', dx: 22, rot: 3 }],
  [
    { side: 'left', dx: -66, rot: -2 },
    { side: 'right', dx: 66, rot: 2 },
  ],
  [
    { side: 'left', dx: -66, rot: -2 },
    { side: 'right', dx: 66, rot: 2 },
  ],
]

/** Altura (en el mundo) de cada estación. El hueco de la carrera es mayor: la zancada se alarga. */
export const walkY: readonly number[] = [0, 330, 660, 1020, 1490, 1820]

/** Escala de las huellas en el lienzo (la huella mide 112 × 256). */
export const WALK_SCALE = 1

/** Puntos de la fase 01: articulaciones que se valoran (metatarsofalángicas, mediopié y talón). */
export const jointPoints = [
  { id: 'mtp1', x: 35, y: 90 },
  { id: 'mtp3', x: 57, y: 80 },
  { id: 'mtp5', x: 80, y: 96 },
  { id: 'mid', x: 70, y: 152 },
  { id: 'heel', x: 54, y: 216 },
] as const

/**
 * Estado del mapa de un pie en una estación. `sub` recorre el apoyo: 0 contacto · 1 apoyo medio · 2 despegue.
 */
export function walkHeat(phase: number, sub: number, footIndex: number): PressureState {
  const s = Math.min(2, Math.max(0, sub))
  switch (phase) {
    case 2:
      return pressureStates[gaitCycle[s]!]
    case 3:
      return pressureStates[runCycle[s]!]
    case 4:
      return footIndex === 0 ? pressureStates.standing : pressureStates.standingAlt
    default:
      return pressureStates.standing
  }
}

/** Reparte el progreso del recorrido en el apoyo de la huella activa (llega, apoya, despega). */
export function subStep(offset: number): 0 | 1 | 2 {
  return offset < -0.17 ? 0 : offset < 0.17 ? 1 : 2
}
