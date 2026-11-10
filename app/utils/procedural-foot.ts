/**
 * Pie estilizado 100 % procedural (sin modelos anatómicos externos). Solo la envolvente exterior:
 * un campo de distancia (SDF) con uniones suaves, poligonizado con surface nets.
 * Ejes: x = talón → dedos, y = arriba, z = lateral (+) / medial (−). Pie derecho, unidades ≈ 10 cm.
 * Silueta estilizada, no anatómicamente exacta.
 */
import { BufferAttribute, BufferGeometry } from 'three'

type Vec = [number, number, number]
type Sdf = (x: number, y: number, z: number) => number

// ---------------------------------------------------------------- primitivas SDF
function smin(a: number, b: number, k: number) {
  const h = Math.max(k - Math.abs(a - b), 0) / k
  return Math.min(a, b) - h * h * k * 0.25
}
const smax = (a: number, b: number, k: number) => -smin(-a, -b, k)

function ellipsoid([cx, cy, cz]: Vec, [rx, ry, rz]: Vec): Sdf {
  return (x, y, z) => {
    const px = x - cx,
      py = y - cy,
      pz = z - cz
    const k0 = Math.sqrt((px / rx) ** 2 + (py / ry) ** 2 + (pz / rz) ** 2)
    const k1 = Math.sqrt((px / (rx * rx)) ** 2 + (py / (ry * ry)) ** 2 + (pz / (rz * rz)) ** 2)
    return k1 === 0 ? -Math.min(rx, ry, rz) : (k0 * (k0 - 1)) / k1
  }
}

/** Cápsula con radio variable (a → b) y sección aplanada en vertical (`flat` < 1). */
function capsule(a: Vec, b: Vec, ra: number, rb = ra, flat = 1): Sdf {
  const cy = (a[1] + b[1]) / 2
  const ay = cy + (a[1] - cy) / flat
  const bx = b[0] - a[0],
    by = cy + (b[1] - cy) / flat - ay,
    bz = b[2] - a[2]
  const len2 = bx * bx + by * by + bz * bz
  return (x, y, z) => {
    const px = x - a[0],
      py = cy + (y - cy) / flat - ay,
      pz = z - a[2]
    const t = Math.min(1, Math.max(0, (px * bx + py * by + pz * bz) / len2))
    const dx = px - bx * t,
      dy = py - by * t,
      dz = pz - bz * t
    return (Math.sqrt(dx * dx + dy * dy + dz * dz) - (ra + (rb - ra) * t)) * flat
  }
}

// ---------------------------------------------------------------- forma
/** Altura del corte de la pierna (el material funde la piel antes de llegar aquí). */
export const FOOT_TOP = 1.45

const heel = ellipsoid([0.36, 0.27, 0.04], [0.33, 0.27, 0.25])
const leg = capsule([0.64, 0.55, 0], [0.6, FOOT_TOP + 0.3, 0], 0.27, 0.235)
const achilles = capsule([0.2, 0.42, 0.04], [0.42, FOOT_TOP + 0.3, 0.02], 0.1, 0.09)
const malleolusMed = ellipsoid([0.72, 0.78, -0.2], [0.08, 0.09, 0.06])
const malleolusLat = ellipsoid([0.6, 0.7, 0.22], [0.08, 0.1, 0.06])
const instep = capsule([0.85, 0.5, 0], [1.78, 0.2, -0.05], 0.26, 0.15) // empeine en rampa
const lateralSole = ellipsoid([1.1, 0.16, 0.08], [0.85, 0.16, 0.3])
const ball = ellipsoid([1.82, 0.15, -0.04], [0.32, 0.15, 0.45])
const ballMedial = ellipsoid([1.85, 0.14, -0.3], [0.22, 0.14, 0.18])
const arch = ellipsoid([1.0, -0.03, -0.36], [0.5, 0.2, 0.26]) // arco plantar interno

/** Dedos (del gordo al meñique): base, nudillo, punta, radios y aplanado de la sección. */
const TOES: { b: Vec; k: Vec; t: Vec; r: Vec; flat: number }[] = [
  {
    b: [1.98, 0.17, -0.33],
    k: [2.24, 0.16, -0.35],
    t: [2.47, 0.12, -0.36],
    r: [0.135, 0.125, 0.115],
    flat: 0.78,
  },
  {
    b: [2.0, 0.15, -0.13],
    k: [2.2, 0.15, -0.125],
    t: [2.38, 0.07, -0.12],
    r: [0.072, 0.066, 0.062],
    flat: 0.85,
  },
  {
    b: [1.97, 0.14, 0.01],
    k: [2.14, 0.14, 0.02],
    t: [2.29, 0.065, 0.025],
    r: [0.068, 0.062, 0.058],
    flat: 0.85,
  },
  {
    b: [1.92, 0.13, 0.14],
    k: [2.06, 0.13, 0.15],
    t: [2.19, 0.06, 0.16],
    r: [0.064, 0.058, 0.055],
    flat: 0.85,
  },
  {
    b: [1.84, 0.12, 0.27],
    k: [1.96, 0.12, 0.285],
    t: [2.07, 0.06, 0.3],
    r: [0.06, 0.054, 0.052],
    flat: 0.85,
  },
]
const toes = TOES.map((t) => {
  const proximal = capsule(t.b, t.k, t.r[0], t.r[1], t.flat)
  const distal = capsule(t.k, t.t, t.r[1], t.r[2], t.flat)
  return (x: number, y: number, z: number) => Math.min(proximal(x, y, z), distal(x, y, z))
})

export const footSdf: Sdf = (x, y, z) => {
  let d = smin(heel(x, y, z), lateralSole(x, y, z), 0.3)
  d = smin(d, instep(x, y, z), 0.3)
  d = smin(d, ball(x, y, z), 0.25)
  d = smin(d, ballMedial(x, y, z), 0.15)
  d = smin(d, leg(x, y, z), 0.3)
  d = smin(d, achilles(x, y, z), 0.15)
  d = smin(d, malleolusMed(x, y, z), 0.16)
  d = smin(d, malleolusLat(x, y, z), 0.16)
  d = smax(d, -arch(x, y, z), 0.12)
  // dedos juntos (surcos estrechos entre ellos) y fundidos con el antepié
  let t = Infinity
  for (const toe of toes) t = smin(t, toe(x, y, z), 0.012)
  d = smin(d, t, 0.1)
  d = smax(d, -y, 0.06) // planta apoyada, con canto redondeado
  return smax(d, y - FOOT_TOP, 0.04)
}

// ---------------------------------------------------------------- poligonización (surface nets)
const CORNERS: Vec[] = Array.from({ length: 8 }, (_, c) => [c & 1, (c >> 1) & 1, (c >> 2) & 1])
const EDGES: [number, number][] = [1, 2, 4].flatMap((bit) =>
  [0, 1, 2, 3, 4, 5, 6, 7].filter((c) => !(c & bit)).map((c) => [c, c | bit] as [number, number]),
)

/** Malla indexada de la isosuperficie sdf = 0, con normales del gradiente del campo (suaves). */
export function polygonize(sdf: Sdf, min: Vec, max: Vec, h: number): BufferGeometry {
  const [nx, ny, nz] = [0, 1, 2].map((a) => Math.ceil((max[a]! - min[a]!) / h) + 1) as Vec
  const field = new Float32Array(nx * ny * nz)
  const at = (i: number, j: number, k: number) => i + nx * (j + ny * k)
  // Por bloques de 4³: si el centro del bloque está lejos de la superficie, todo el bloque tiene su mismo
  // signo y no aporta cruces → se rellena sin evaluar punto a punto (≈ 5× más rápido).
  const B = 4
  for (let bk = 0; bk < nz; bk += B)
    for (let bj = 0; bj < ny; bj += B)
      for (let bi = 0; bi < nx; bi += B) {
        const dc = sdf(min[0] + (bi + 1.5) * h, min[1] + (bj + 1.5) * h, min[2] + (bk + 1.5) * h)
        const far = Math.abs(dc) > 6 * h
        for (let k = bk; k < Math.min(bk + B, nz); k++)
          for (let j = bj; j < Math.min(bj + B, ny); j++)
            for (let i = bi; i < Math.min(bi + B, nx); i++)
              field[at(i, j, k)] = far ? dc : sdf(min[0] + i * h, min[1] + j * h, min[2] + k * h)
      }

  // Un vértice por celda que cruza la superficie: media de los cruces en sus aristas.
  const cx = nx - 1,
    cy = ny - 1
  const cell = new Int32Array(cx * cy * (nz - 1)).fill(-1)
  const cellAt = (i: number, j: number, k: number) => i + cx * (j + cy * k)
  const pos: number[] = []
  const v = new Float32Array(8)
  for (let k = 0; k < nz - 1; k++)
    for (let j = 0; j < ny - 1; j++)
      for (let i = 0; i < nx - 1; i++) {
        let inside = 0
        for (let c = 0; c < 8; c++) {
          const [di, dj, dk] = CORNERS[c]!
          v[c] = field[at(i + di, j + dj, k + dk)]!
          if (v[c]! < 0) inside++
        }
        if (inside === 0 || inside === 8) continue
        let sx = 0,
          sy = 0,
          sz = 0,
          count = 0
        for (const [a, b] of EDGES) {
          const va = v[a]!,
            vb = v[b]!
          if (va < 0 === vb < 0) continue
          const t = va / (va - vb)
          const ca = CORNERS[a]!,
            cb = CORNERS[b]!
          sx += ca[0] + (cb[0] - ca[0]) * t
          sy += ca[1] + (cb[1] - ca[1]) * t
          sz += ca[2] + (cb[2] - ca[2]) * t
          count++
        }
        cell[cellAt(i, j, k)] = pos.length / 3
        pos.push(min[0] + (i + sx / count) * h, min[1] + (j + sy / count) * h, min[2] + (k + sz / count) * h)
      }

  // Un quad por cada arista de la rejilla que cruza la superficie, orientado hacia fuera (campo creciente).
  const index: number[] = []
  const QUAD = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ]
  for (let k = 1; k < nz - 1; k++)
    for (let j = 1; j < ny - 1; j++)
      for (let i = 1; i < nx - 1; i++) {
        const v0 = field[at(i, j, k)]!
        for (let a = 0; a < 3; a++) {
          const v1 = field[at(i + +(a === 0), j + +(a === 1), k + +(a === 2))]!
          if (v0 < 0 === v1 < 0) continue
          const b = (a + 1) % 3,
            c = (a + 2) % 3
          const q = QUAD.map(([db, dc]) => {
            const p = [i, j, k]
            p[b]! -= db!
            p[c]! -= dc!
            return cell[cellAt(p[0]!, p[1]!, p[2]!)]!
          })
          if (v0 < 0) index.push(q[0]!, q[1]!, q[2]!, q[0]!, q[2]!, q[3]!)
          else index.push(q[0]!, q[2]!, q[1]!, q[0]!, q[3]!, q[2]!)
        }
      }

  const normals = new Float32Array(pos.length)
  const e = h * 0.5
  for (let p = 0; p < pos.length; p += 3) {
    const x = pos[p]!,
      y = pos[p + 1]!,
      z = pos[p + 2]!
    const gx = sdf(x + e, y, z) - sdf(x - e, y, z)
    const gy = sdf(x, y + e, z) - sdf(x, y - e, z)
    const gz = sdf(x, y, z + e) - sdf(x, y, z - e)
    const len = Math.sqrt(gx * gx + gy * gy + gz * gz) || 1
    normals[p] = gx / len
    normals[p + 1] = gy / len
    normals[p + 2] = gz / len
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  geometry.setAttribute('normal', new BufferAttribute(normals, 3))
  geometry.setIndex(index)
  return geometry
}

/**
 * Oclusión ambiental horneada en color de vértice, muestreando el SDF a lo largo de la normal:
 * oscurece surcos entre dedos, arco y zonas bajo los maléolos (volumen sin texturas).
 */
export function bakeAmbientOcclusion(geometry: BufferGeometry, sdf: Sdf, step = 0.035, strength = 3) {
  const P = geometry.getAttribute('position').array
  const N = geometry.getAttribute('normal').array
  const colors = new Float32Array(P.length)
  for (let p = 0; p < P.length; p += 3) {
    let occlusion = 0
    for (let i = 1, w = 0.5; i <= 5; i++, w *= 0.5) {
      const d = i * step
      occlusion += w * (d - sdf(P[p]! + N[p]! * d, P[p + 1]! + N[p + 1]! * d, P[p + 2]! + N[p + 2]! * d))
    }
    const ao = Math.min(1, Math.max(0, 1 - (strength * occlusion) / step))
    // las zonas ocluidas tienden al azul de marca, no al gris
    colors[p] = 0.42 + 0.58 * ao
    colors[p + 1] = 0.55 + 0.45 * ao
    colors[p + 2] = 0.72 + 0.28 * ao
  }
  geometry.setAttribute('color', new BufferAttribute(colors, 3))
}

// ---------------------------------------------------------------- API
export function buildFootGeometry(quality: 'full' | 'lite' = 'full') {
  const t0 = performance.now()
  const h = quality === 'full' ? 0.018 : 0.026
  const geometry = polygonize(footSdf, [-0.08, -0.08, -0.6], [2.7, FOOT_TOP + 0.08, 0.55], h)
  bakeAmbientOcclusion(geometry, footSdf)
  return { geometry, buildMs: performance.now() - t0 }
}
