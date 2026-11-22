/**
 * Campo de fibras (spec 08 §4.3): una sola malla instanciada (InstancedBufferGeometry) con un shader que
 * recorre las 5 fases según `uProgress`. Todo ocurre en la GPU: ninguna matriz se actualiza en CPU.
 * Las fases usan los mismos tramos que FIBER_PHASES (app/features/services/utils/insole-scene.ts).
 */
import {
  BufferGeometry,
  Color,
  CylinderGeometry,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  ShaderMaterial,
  Vector3,
} from 'three'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import { buildFiberAttributes, seededRandom, type FiberSample } from '~/features/services/utils/insole-scene'

const vertexShader = /* glsl */ `
  attribute vec3 aStart;
  attribute vec3 aEnd;
  attribute vec3 aDir;
  attribute vec3 aRandDir;
  attribute vec4 aParams; // x retardo · y longitud · z aleatorio

  uniform float uProgress;
  uniform float uTime;
  uniform float uRadius;

  varying float vAlpha;
  varying float vShade;
  varying float vRand;

  void main() {
    float p = uProgress;
    float delay = aParams.x;
    float len = aParams.y;
    float rnd = aParams.z;

    // 0–0.2 aparición (escalonada) · 0.2–0.45 agrupación · 0.45–0.65 alineación · 0.85–1 desvanecido
    float appear = smoothstep(delay * 0.12, 0.08 + delay * 0.12, p);
    float gather = smoothstep(0.2 + delay * 0.13, 0.45, p);
    gather = gather * gather * (3.0 - 2.0 * gather);
    float align = smoothstep(0.42, 0.65, p);
    float fade = 1.0 - smoothstep(0.85, 1.0, p);

    vec3 drift = vec3(
      sin(uTime * 0.7 + rnd * 6.2831),
      cos(uTime * 0.55 + rnd * 12.566),
      sin(uTime * 0.45 + rnd * 3.1415)
    ) * 0.006 * (1.0 - gather);
    vec3 center = mix(aStart + drift, aEnd, gather);

    vec3 dir = normalize(mix(aRandDir, aDir, align) + 1e-4);
    vec3 helper = abs(dir.y) < 0.95 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 t1 = normalize(cross(helper, dir));
    vec3 t2 = cross(dir, t1);

    float s = appear;
    vec3 local = t1 * position.x * uRadius * s
               + t2 * position.z * uRadius * s
               + dir * position.y * len * s * mix(0.55, 1.0, align);

    vec3 n = normalize(t1 * normal.x + t2 * normal.z);
    vShade = 0.62 + 0.38 * max(dot(n, normalize(vec3(-0.35, 0.85, 0.4))), 0.0);
    vAlpha = appear * fade;
    vRand = rnd;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(center + local, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorHi;
  uniform float uOpacity;

  varying float vAlpha;
  varying float vShade;
  varying float vRand;

  void main() {
    vec3 base = mix(uColorA, uColorB, vRand);
    vec3 color = mix(base, uColorHi, smoothstep(0.85, 1.0, vShade) * 0.6) * vShade;
    gl_FragColor = vec4(color, vAlpha * uOpacity * 0.9);
    #include <colorspace_fragment>
  }
`

/** Geometría con solo las caras orientadas hacia arriba de una malla, en el espacio indicado por `matrix`. */
export function upwardSurface(mesh: Mesh, minNormalY = 0.35): BufferGeometry {
  const geometry = mesh.geometry
  const pos = geometry.getAttribute('position')
  const index = geometry.getIndex()
  const triCount = index ? index.count / 3 : pos.count / 3
  const a = new Vector3()
  const b = new Vector3()
  const c = new Vector3()
  const ab = new Vector3()
  const ac = new Vector3()
  const out: number[] = []
  for (let t = 0; t < triCount; t++) {
    const ia = index ? index.getX(t * 3) : t * 3
    const ib = index ? index.getX(t * 3 + 1) : t * 3 + 1
    const ic = index ? index.getX(t * 3 + 2) : t * 3 + 2
    // fromBufferAttribute descuantiza (atributos normalizados de meshopt/quantize)
    a.fromBufferAttribute(pos, ia).applyMatrix4(mesh.matrixWorld)
    b.fromBufferAttribute(pos, ib).applyMatrix4(mesh.matrixWorld)
    c.fromBufferAttribute(pos, ic).applyMatrix4(mesh.matrixWorld)
    const n = ab.subVectors(b, a).cross(ac.subVectors(c, a)).normalize()
    if (n.y < minNormalY) continue
    out.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z)
  }
  const surface = new BufferGeometry()
  surface.setAttribute('position', new Float32BufferAttribute(out, 3))
  surface.computeVertexNormals()
  return surface
}

/** Muestrea `count` puntos de la superficie con semilla fija. */
export function sampleSurface(surface: BufferGeometry, count: number, seed = 7): FiberSample[] {
  const sampler = new MeshSurfaceSampler(new Mesh(surface))
  // Existe en three (r150+) aunque @types/three no lo declara
  ;(sampler as MeshSurfaceSampler & { setRandomGenerator: (fn: () => number) => void }).setRandomGenerator(
    seededRandom(seed),
  )
  sampler.build()
  const p = new Vector3()
  const n = new Vector3()
  const samples: FiberSample[] = []
  for (let i = 0; i < count; i++) {
    sampler.sample(p, n)
    samples.push({ position: [p.x, p.y, p.z], normal: [n.x, n.y, n.z] })
  }
  return samples
}

export interface FiberField {
  mesh: Mesh<InstancedBufferGeometry, ShaderMaterial>
  uniforms: {
    uProgress: { value: number }
    uTime: { value: number }
    uOpacity: { value: number }
  }
  dispose: () => void
}

export function createFiberField(samples: readonly FiberSample[]): FiberField {
  const attrs = buildFiberAttributes(samples)
  const base = new CylinderGeometry(1, 1, 1, 5, 1, true)
  const geometry = new InstancedBufferGeometry()
  geometry.index = base.index
  geometry.setAttribute('position', base.getAttribute('position'))
  geometry.setAttribute('normal', base.getAttribute('normal'))
  geometry.setAttribute('aStart', new InstancedBufferAttribute(attrs.start, 3))
  geometry.setAttribute('aEnd', new InstancedBufferAttribute(attrs.end, 3))
  geometry.setAttribute('aDir', new InstancedBufferAttribute(attrs.dir, 3))
  geometry.setAttribute('aRandDir', new InstancedBufferAttribute(attrs.randDir, 3))
  geometry.setAttribute('aParams', new InstancedBufferAttribute(attrs.params, 4))
  geometry.instanceCount = attrs.count

  const uniforms = {
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uOpacity: { value: 1 },
    uRadius: { value: 0.00028 },
    uColorA: { value: new Color('#7FD0EE') },
    uColorB: { value: new Color('#1EABE1') },
    uColorHi: { value: new Color('#FFFFFF') },
  }
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    toneMapped: false, // conserva el cian de marca (AgX lo desatura)
  })
  const mesh = new Mesh(geometry, material)
  mesh.frustumCulled = false // las posiciones se calculan en el shader
  mesh.renderOrder = 2

  return {
    mesh,
    uniforms,
    dispose: () => {
      base.dispose()
      geometry.dispose()
      material.dispose()
    },
  }
}
