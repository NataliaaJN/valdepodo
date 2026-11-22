/**
 * Coreografía del paso del pie del hero: función pura de `progress` (0 → 1), sin three.js ni DOM.
 *
 * El GLB no tiene rig (cada hueso y músculo es un nodo suelto y la piel es una sola malla), así que el paso
 * se aproxima con el modelo entero: cabeceo (rotación sobre el eje lateral X) + traslación, y el PIVOTE
 * lo decide el contacto con el suelo, no el centro geométrico:
 *   · antes del contacto el pie está en el aire (balanceo): avanza, desciende y dorsiflexiona (puntera arriba);
 *   · desde el contacto, el punto más bajo de la suela queda clavado en el suelo y el pie rueda sobre él:
 *     talón → (pie plano) → antepié, cambiando de pivote solo, sin saltos.
 * La suela se muestrea del propio modelo (perfil de la piel) y la simulación se precalcula en una tabla.
 */

export interface SolePoint {
  x: number
  y: number
  z: number
}

export interface StepPose {
  /** Cabeceo (rad): + = talón arriba y puntera abajo, − = puntera arriba. */
  theta: number
  /** Giro suave alrededor del eje vertical (rad), a sumar a la orientación del hero. */
  yaw: number
  /** Traslación del modelo (en unidades del modelo). */
  y: number
  z: number
  /** Punto de contacto actual con el suelo (x, z). */
  contactX: number
  contactZ: number
  /** 0 → en el aire · 1 → apoyado. */
  press: number
  /** 0 → lejos del suelo · 1 → en contacto (para el suelo tenue). */
  near: number
  /** Primer contacto del talón (x, z) y avance de la onda (0 → 1, 0 si no hay). */
  hitX: number
  hitZ: number
  ripple: number
}

export interface StepTable {
  poses: StepPose[]
  floorY: number
  /** Largo de la suela (unidades del modelo). */
  length: number
}

/** Progreso en el que el talón toca el suelo (tramo 20–45 %). */
export const STEP_CONTACT = 0.3
const RIPPLE_SPAN = 0.14
const SAMPLES = 360

type Key = readonly [number, number]

/** Cabeceo en el progreso: puntera arriba al contactar (−), pie plano ~0.5, talón arriba y puntera abajo (+). */
const PITCH_KEYS: readonly Key[] = [
  [0, 0],
  [0.12, -0.035],
  [STEP_CONTACT, -0.2],
  [0.48, 0.015],
  [0.7, 0.2],
  [0.9, 0.33],
  [1, 0.37],
]

/** Interpolación cúbica monótona (Fritsch–Carlson): suave, sin rebotes ni sobreoscilaciones. */
function pchip(keys: readonly Key[], x: number, flatEnds = true): number {
  const n = keys.length
  if (x <= keys[0]![0]) return keys[0]![1]
  if (x >= keys[n - 1]![0]) return keys[n - 1]![1]
  const h: number[] = []
  const d: number[] = []
  for (let i = 0; i < n - 1; i++) {
    h[i] = keys[i + 1]![0] - keys[i]![0]
    d[i] = (keys[i + 1]![1] - keys[i]![1]) / h[i]!
  }
  const m: number[] = new Array(n).fill(0)
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1]! * d[i]! > 0) {
      const w1 = 2 * h[i]! + h[i - 1]!
      const w2 = h[i]! + 2 * h[i - 1]!
      m[i] = (w1 + w2) / (w1 / d[i - 1]! + w2 / d[i]!)
    }
  }
  if (!flatEnds) {
    m[0] = d[0]!
    m[n - 1] = d[n - 2]!
  }
  let i = 0
  while (x > keys[i + 1]![0]) i++
  const t = (x - keys[i]![0]) / h[i]!
  const t2 = t * t
  const t3 = t2 * t
  return (
    (2 * t3 - 3 * t2 + 1) * keys[i]![1] +
    (t3 - 2 * t2 + t) * h[i]! * m[i]! +
    (-2 * t3 + 3 * t2) * keys[i + 1]![1] +
    (t3 - t2) * h[i]! * m[i + 1]!
  )
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export function pitchAt(progress: number): number {
  return pchip(PITCH_KEYS, progress)
}

/**
 * Reduce el perfil de la piel a una polilínea de suela: el punto más bajo de cada franja a lo largo del pie (eje Z).
 * `vertices` son posiciones en el marco del modelo (Y arriba, puntera hacia +Z).
 */
export function soleProfile(vertices: ArrayLike<number>, bins = 36): SolePoint[] {
  let zMin = Infinity
  let zMax = -Infinity
  for (let i = 0; i < vertices.length; i += 3) {
    zMin = Math.min(zMin, vertices[i + 2]!)
    zMax = Math.max(zMax, vertices[i + 2]!)
  }
  const lowest: (SolePoint | undefined)[] = new Array(bins)
  for (let i = 0; i < vertices.length; i += 3) {
    const z = vertices[i + 2]!
    const b = Math.min(bins - 1, Math.floor(((z - zMin) / (zMax - zMin)) * bins))
    const cur = lowest[b]
    if (!cur || vertices[i + 1]! < cur.y) lowest[b] = { x: vertices[i]!, y: vertices[i + 1]!, z }
  }
  return lowest.filter((p): p is SolePoint => !!p)
}

/**
 * Simula el paso sobre la suela y devuelve una tabla muestreada en progreso.
 * `sole` es el perfil completo; el antepié efectivo se recorta en el 80 % del largo (los dedos no son
 * articulables en este modelo, así que no deben actuar de palanca).
 */
export function buildStepTable(sole: readonly SolePoint[]): StepTable {
  const zMin = Math.min(...sole.map((p) => p.z))
  const zMax = Math.max(...sole.map((p) => p.z))
  const length = zMax - zMin
  const effective = sole.filter((p) => p.z <= zMin + length * 0.8)

  const liftStart = length * 0.04
  const advance = length * 0.05
  const liftKeys: readonly Key[] = [
    [0, liftStart],
    [0.1, liftStart * 0.92],
    [0.2, liftStart * 0.5],
    [STEP_CONTACT, 0],
  ]
  const advanceKeys: readonly Key[] = [
    [0, 0],
    [0.1, advance * 0.06],
    [0.2, advance * 0.5],
    [STEP_CONTACT, advance],
  ]

  const rotate = (pt: SolePoint, theta: number) => {
    const c = Math.cos(theta)
    const s = Math.sin(theta)
    return { y: pt.y * c - pt.z * s, z: pt.y * s + pt.z * c }
  }
  const lowestIndex = (theta: number) => {
    let idx = 0
    let min = Infinity
    effective.forEach((pt, i) => {
      const y = rotate(pt, theta).y
      if (y < min) {
        min = y
        idx = i
      }
    })
    return { idx, min }
  }

  const floorY = lowestIndex(0).min - liftStart // en p = 0 el pie queda tal cual, algo elevado
  const poses: StepPose[] = []
  let contact = -1
  let pinnedZ = 0
  let hitX = 0
  let hitZ = 0

  for (let i = 0; i <= SAMPLES; i++) {
    const p = i / SAMPLES
    const theta = pitchAt(p)
    const lift = pchip(liftKeys, p)
    const { idx, min } = lowestIndex(theta)
    const y = floorY + lift - min

    let z: number
    if (p < STEP_CONTACT) {
      z = pchip(advanceKeys, p)
    } else {
      if (contact === -1) {
        // Primer contacto: talón. A partir de aquí ese punto queda clavado en el suelo.
        contact = idx
        const adv = pchip(advanceKeys, STEP_CONTACT)
        pinnedZ = rotate(effective[contact]!, theta).z + adv
        hitX = effective[contact]!.x
        hitZ = pinnedZ
      } else if (idx !== contact) {
        // Cambio de pivote (talón → antepié): el nuevo punto queda clavado donde está, sin salto.
        pinnedZ = rotate(effective[idx]!, theta).z + (pinnedZ - rotate(effective[contact]!, theta).z)
        contact = idx
      }
      z = pinnedZ - rotate(effective[contact]!, theta).z
    }

    const active = contact === -1 ? idx : contact
    const q = (p - STEP_CONTACT) / RIPPLE_SPAN
    poses.push({
      theta,
      yaw: -0.12 * smoothstep(STEP_CONTACT, 1, p),
      y,
      z,
      contactX: effective[active]!.x,
      contactZ: rotate(effective[active]!, theta).z + z,
      press: smoothstep(STEP_CONTACT, STEP_CONTACT + 0.05, p),
      near: 1 - lift / liftStart,
      hitX,
      hitZ,
      ripple: q > 0 && q < 1 ? q : 0,
    })
  }
  return { poses, floorY, length }
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t

/** Pose en un progreso cualquiera (interpolación lineal entre muestras de la tabla). */
export function sampleStep(table: StepTable, progress: number): StepPose {
  const f = Math.min(1, Math.max(0, progress)) * (table.poses.length - 1)
  const i = Math.min(table.poses.length - 2, Math.floor(f))
  const t = f - i
  const a = table.poses[i]!
  const b = table.poses[i + 1]!
  return {
    theta: mix(a.theta, b.theta, t),
    yaw: mix(a.yaw, b.yaw, t),
    y: mix(a.y, b.y, t),
    z: mix(a.z, b.z, t),
    contactX: mix(a.contactX, b.contactX, t),
    contactZ: mix(a.contactZ, b.contactZ, t),
    press: mix(a.press, b.press, t),
    near: mix(a.near, b.near, t),
    hitX: b.hitX,
    hitZ: b.hitZ,
    ripple: mix(a.ripple, b.ripple, t),
  }
}
