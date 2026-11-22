/**
 * Lógica pura de la plantilla conceptual (spec 08 §4): fases de la construcción por fibras, estado de cada
 * capa y atributos por instancia de las fibras. Sin dependencias de WebGL, para poder probarla en Node.
 */
import insoleConfig from '~~/tools/blender/config/insole.json'

export type InsoleLayerId = 'top' | 'middle' | 'base'

/** Encuadre compartido con los pósters de Blender (tools/blender/config/insole.json → view). */
type Vec3 = [number, number, number]
export const INSOLE_VIEW = {
  ...insoleConfig.view,
  position: insoleConfig.view.position as Vec3,
  target: insoleConfig.view.target as Vec3,
}

/** Número de fibras por nivel de dispositivo (spec 08 §1.5). */
export const FIBER_COUNT = { full: 6000, lite: 1500 } as const

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp01((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}

/**
 * Tramos de `fiberProgress` (spec 08 §4.3):
 * 0–0.2 aparición · 0.2–0.45 agrupación · 0.45–0.65 superficie · 0.65–0.85 volumen · 0.85–1 plantilla final.
 * El shader de las fibras usa las mismas cifras (FiberField.vue).
 */
export const FIBER_PHASES = {
  appear: [0, 0.2],
  gather: [0.2, 0.45],
  surface: [0.45, 0.65],
  volume: [0.65, 0.85],
  final: [0.85, 1],
} as const

export interface LayerState {
  /** 0 invisible → 1 opaca. */
  opacity: number
  /** Escala vertical (crecimiento del espesor). */
  scaleY: number
  /** Desplazamiento vertical por la explosión, en metros. */
  offsetY: number
}

/**
 * Estado de una capa a partir de la explosión (0..1) y la construcción (0..1; 1 = plantilla completa).
 * - La capa superior aparece semitransparente en "superficie" y se completa al final.
 * - La intermedia y la base crecen en espesor durante "volumen".
 */
export function layerState(
  id: InsoleLayerId,
  explodeOffset: number,
  explode: number,
  build: number,
): LayerState {
  const final = smoothstep(...FIBER_PHASES.final, build)
  if (id === 'top') {
    const surface = smoothstep(...FIBER_PHASES.surface, build)
    return { opacity: Math.max(surface * 0.45, final), scaleY: 1, offsetY: explode * explodeOffset }
  }
  const volume = smoothstep(...FIBER_PHASES.volume, build)
  return {
    opacity: Math.max(volume * 0.6, final),
    scaleY: Math.max(0.001, volume),
    offsetY: explode * explodeOffset,
  }
}

/** Opacidad global de las fibras: aparecen al principio y se desvanecen en la plantilla final. */
export function fiberOpacity(build: number) {
  return smoothstep(0, 0.08, build) * (1 - smoothstep(...FIBER_PHASES.final, build))
}

/** Generador pseudoaleatorio con semilla (mulberry32): mismas fibras en cada carga. */
export function seededRandom(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface FiberSample {
  position: readonly [number, number, number]
  normal: readonly [number, number, number]
}

export interface FiberAttributes {
  count: number
  /** vec3: posición dispersa inicial. */
  start: Float32Array
  /** vec3: punto sobre la superficie de la capa superior. */
  end: Float32Array
  /** vec3: dirección final, tangente a la superficie y alineada (con variación) con el eje de la plantilla. */
  dir: Float32Array
  /** vec3: dirección aleatoria en la fase dispersa. */
  randDir: Float32Array
  /** vec4: retardo (0..1), longitud (m), aleatorio (0..1), libre. */
  params: Float32Array
}

function normalize(v: [number, number, number]): [number, number, number] {
  const l = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}

/**
 * Atributos por instancia a partir de puntos muestreados en la cara superior de `layer_top`
 * (eje longitudinal de la plantilla = Z, arriba = Y).
 */
export function buildFiberAttributes(samples: readonly FiberSample[], seed = 42): FiberAttributes {
  const rand = seededRandom(seed)
  const count = samples.length
  const start = new Float32Array(count * 3)
  const end = new Float32Array(count * 3)
  const dir = new Float32Array(count * 3)
  const randDir = new Float32Array(count * 3)
  const params = new Float32Array(count * 4)

  samples.forEach((s, i) => {
    const [px, py, pz] = s.position
    const n = normalize([...s.normal])
    // Punto final: un poco por encima de la superficie para no fundirse con ella
    end.set([px + n[0] * 0.0007, py + n[1] * 0.0007, pz + n[2] * 0.0007], i * 3)

    // Dirección: eje longitudinal proyectado en el plano tangente, girado ±20° y curvado hacia el contorno
    const angle = (rand() - 0.5) * 0.7 + px * 6
    const axis: [number, number, number] = [Math.sin(angle), 0, Math.cos(angle)]
    const dot = axis[0] * n[0] + axis[1] * n[1] + axis[2] * n[2]
    dir.set(normalize([axis[0] - n[0] * dot, axis[1] - n[1] * dot, axis[2] - n[2] * dot]), i * 3)

    // Posición dispersa: nube sobre la plantilla, contenida en el encuadre
    const theta = rand() * Math.PI * 2
    const r = 0.025 + rand() * 0.07
    start.set(
      [px * 0.8 + Math.cos(theta) * r, py + 0.03 + rand() * 0.09, pz * 0.85 + Math.sin(theta) * r],
      i * 3,
    )

    randDir.set(normalize([rand() - 0.5, rand() - 0.5, rand() - 0.5]), i * 3)
    params.set([rand(), 0.005 + rand() * 0.009, rand(), 0], i * 4)
  })

  return { count, start, end, dir, randDir, params }
}
