/**
 * Geometría de la huella y modelo de los mapas de presión ilustrativos (spec 04 §1.4, spec 08 §3).
 * Todo en coordenadas locales de la huella DERECHA vista desde arriba (dedos arriba, eje y hacia abajo).
 * La huella izquierda se dibuja reflejando el grupo: los datos sirven para los dos pies.
 *
 * Es una visualización ilustrativa: los focos NO son mediciones ni representan valores clínicos.
 */

export const FOOT_W = 112
export const FOOT_H = 256

export type FootSide = 'left' | 'right'

/** Cambio de estado de los gráficos: interpolar (escritorio), fundido (tablet) o inmediato (reduced motion). */
export type MapTransition = 'morph' | 'fade' | 'instant'

/** Contorno de la planta (sin dedos): antepié ancho, arco interno cóncavo, banda lateral y talón. */
export const SOLE_PATH =
  'M22 92C20 74 34 62 52 62C70 62 88 68 94 84C99 98 96 116 90 132C84 150 82 170 82 188' +
  'C82 222 70 246 54 246C36 246 26 226 28 200C30 180 44 160 44 140C44 122 26 112 22 92Z'

export interface Toe {
  cx: number
  cy: number
  rx: number
  ry: number
  /** Giro en grados (sentido horario). */
  rot: number
}

/** Dedos como huellas separadas, del primero (hallux, lado interno) al quinto. */
export const TOES: readonly Toe[] = [
  { cx: 34, cy: 45, rx: 12, ry: 15, rot: -8 },
  { cx: 55.5, cy: 39, rx: 7, ry: 9, rot: 4 },
  { cx: 69, cy: 44, rx: 6.4, ry: 8, rot: 12 },
  { cx: 80, cy: 52, rx: 5.8, ry: 7, rot: 20 },
  { cx: 88.5, cy: 62.5, rx: 5, ry: 6, rot: 28 },
]

/** Intensidad del área de contacto (toda la huella apoyada), para que el mapa no sean focos sueltos. */
export const CONTACT_INTENSITY = 0.14

/** Silueta de plantilla (algo mayor que la huella y sin dedos), para la fase "propuesta de tratamiento". */
export const INSOLE_PATH =
  'M14 88C12 50 34 22 58 22C82 22 98 46 101 76C104 100 100 120 94 138C88 156 88 176 88 192' +
  'C88 230 72 252 54 252C34 252 20 232 21 200C22 178 34 160 34 140C34 120 16 112 14 88Z'

/** Trayectoria típica del centro de presiones en el apoyo (talón → borde lateral → antepié interno → hallux). */
export const PRESSURE_CENTER_PATH = 'M56 230C58 206 62 184 64 160C66 136 62 112 52 94C44 80 38 66 35 48'

/** Puntos de apoyo clásicos del trípode del pie (talón, cabeza del 1.er y del 5.º metatarsiano). */
export const SUPPORT_POINTS = [
  { id: 'heel', x: 54, y: 218 },
  { id: 'met1', x: 33, y: 90 },
  { id: 'met5', x: 84, y: 98 },
] as const

/* ---------------------------------------------------------------------------------------------- */
/* Focos de presión                                                                                */
/* ---------------------------------------------------------------------------------------------- */

/** Siempre el mismo número de focos y en el mismo orden: así GSAP puede interpolar estado a estado. */
export const FOCUS_KEYS = ['heel', 'midfoot', 'met1', 'met23', 'met45', 'hallux', 'toes'] as const
export type FocusKey = (typeof FOCUS_KEYS)[number]

export interface Focus {
  x: number
  y: number
  /** Radio del foco en unidades de la huella. */
  r: number
  /** 0 (sin carga) → 1 (máxima de la escala ilustrativa). */
  intensity: number
}

export type PressureState = Record<FocusKey, Focus>

/** Posición y radio de reposo de cada foco. */
const BASE: Record<FocusKey, Omit<Focus, 'intensity'>> = {
  heel: { x: 54, y: 214, r: 36 },
  midfoot: { x: 72, y: 162, r: 24 },
  met1: { x: 35, y: 90, r: 24 },
  met23: { x: 57, y: 80, r: 24 },
  met45: { x: 80, y: 96, r: 20 },
  hallux: { x: 34, y: 46, r: 17 },
  toes: { x: 70, y: 48, r: 18 },
}

type Overrides = Partial<Record<FocusKey, Partial<Focus>>>

/** Construye un estado a partir de las intensidades (y, si hace falta, desplazamientos) de cada foco. */
export function defineState(intensity: Record<FocusKey, number>, overrides: Overrides = {}): PressureState {
  const out = {} as PressureState
  for (const key of FOCUS_KEYS) {
    out[key] = { ...BASE[key], intensity: intensity[key], ...overrides[key] }
  }
  return out
}

export function focusList(state: PressureState): Focus[] {
  return FOCUS_KEYS.map((key) => state[key])
}

/** Interpolación lineal entre dos estados (t en 0..1). La usa la animación y sirve para las pruebas. */
export function lerpState(a: PressureState, b: PressureState, t: number): PressureState {
  const k = Math.min(1, Math.max(0, t))
  const out = {} as PressureState
  for (const key of FOCUS_KEYS) {
    const fa = a[key]
    const fb = b[key]
    out[key] = {
      x: fa.x + (fb.x - fa.x) * k,
      y: fa.y + (fb.y - fa.y) * k,
      r: fa.r + (fb.r - fa.r) * k,
      intensity: fa.intensity + (fb.intensity - fa.intensity) * k,
    }
  }
  return out
}

/**
 * Rampa de color del mapa (spec 04 §1.1): sin carga → deep-blue/primary-strong → primary → cyan → ice-blue → blanco.
 * La parada baja usa primary-strong (más saturado que deep-blue) para que el área de contacto no se vea gris.
 * Se aplica en un filtro SVG (feComponentTransfer) sobre la opacidad acumulada de los focos.
 * Seis paradas equiespaciadas (t = 0, 0.2 … 1); valores 0..1 en sRGB.
 */
/**
 * Rampa «clínica» de los mapas de presión habituales (baropodometría): azul → cian → verde → amarillo → naranja → rojo.
 * Mismas seis paradas y mismo formato que `PRESSURE_RAMP`; «El paseo» la usa para que el mapa se lea como en consulta.
 */
export const CLINICAL_RAMP = {
  r: [0.1, 0.0, 0.2, 1, 1, 0.9],
  g: [0.2, 0.75, 0.85, 0.9, 0.5, 0.1],
  b: [0.85, 0.95, 0.25, 0.1, 0.05, 0.1],
  a: [0, 0.6, 0.92, 1, 1, 1],
} as const

export const PRESSURE_RAMP = {
  r: [0.086, 0.043, 0.071, 0.118, 0.725, 1],
  g: [0.235, 0.369, 0.439, 0.671, 0.898, 1],
  b: [0.388, 0.6, 0.714, 0.882, 0.953, 1],
  a: [0, 0.4, 0.85, 1, 1, 1],
} as const
