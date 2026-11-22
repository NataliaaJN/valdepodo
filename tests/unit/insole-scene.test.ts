import { describe, expect, it } from 'vitest'
import { CONCEPTUAL_LABEL, fiberSteps, insoleLayers } from '~/features/services/data/insole'
import {
  FIBER_COUNT,
  FIBER_PHASES,
  INSOLE_VIEW,
  buildFiberAttributes,
  fiberOpacity,
  layerState,
  seededRandom,
  type FiberSample,
} from '~/features/services/utils/insole-scene'
import insoleConfig from '~~/tools/blender/config/insole.json'

const samples: FiberSample[] = Array.from({ length: 50 }, (_, i) => ({
  position: [(i % 10) * 0.005 - 0.025, 0.004, i * 0.004 - 0.1],
  normal: [0, 1, 0],
}))

describe('fases de la construcción por fibras', () => {
  it('cubren 0..1 sin huecos ni solapes, en el orden de la spec 08 §4.3', () => {
    const phases = Object.values(FIBER_PHASES)
    expect(phases[0]![0]).toBe(0)
    expect(phases.at(-1)![1]).toBe(1)
    for (let i = 1; i < phases.length; i++) expect(phases[i]![0]).toBe(phases[i - 1]![1])
  })

  it('los 5 pasos del texto usan los mismos tramos', () => {
    expect(fiberSteps.map((s) => s.range)).toEqual(Object.values(FIBER_PHASES))
  })

  it('plantilla completa (build 1): capas opacas, sin fibras', () => {
    for (const id of ['top', 'middle', 'base'] as const) {
      const s = layerState(id, 0.03, 0, 1)
      expect(s.opacity).toBeCloseTo(1)
      expect(s.scaleY).toBeCloseTo(1)
    }
    expect(fiberOpacity(1)).toBe(0)
  })

  it('fibras dispersas (build 0.1): capas ocultas, fibras visibles', () => {
    for (const id of ['top', 'middle', 'base'] as const) expect(layerState(id, 0, 0, 0.1).opacity).toBe(0)
    expect(fiberOpacity(0.1)).toBeGreaterThan(0.9)
  })

  it('superficie antes que volumen: la capa superior aparece antes de que crezcan las demás', () => {
    expect(layerState('top', 0, 0, 0.6).opacity).toBeGreaterThan(0)
    expect(layerState('middle', 0, 0, 0.6).scaleY).toBeLessThan(0.01)
    expect(layerState('middle', 0, 0, 0.8).scaleY).toBeGreaterThan(0.5)
  })

  it('la explosión desplaza cada capa según su explodeOffset', () => {
    expect(layerState('top', 0.064, 1, 1).offsetY).toBeCloseTo(0.064)
    expect(layerState('base', 0, 1, 1).offsetY).toBe(0)
    expect(layerState('middle', 0.032, 0.5, 1).offsetY).toBeCloseTo(0.016)
  })
})

describe('atributos de las fibras', () => {
  it('tamaños correctos y deterministas con la misma semilla', () => {
    const a = buildFiberAttributes(samples, 42)
    const b = buildFiberAttributes(samples, 42)
    expect(a.count).toBe(50)
    expect(a.start).toHaveLength(150)
    expect(a.params).toHaveLength(200)
    expect(a.start).toEqual(b.start)
    expect(buildFiberAttributes(samples, 43).start).not.toEqual(a.start)
  })

  it('direcciones finales unitarias y tangentes a la superficie', () => {
    const { dir } = buildFiberAttributes(samples)
    for (let i = 0; i < samples.length; i++) {
      const [x, y, z] = [dir[i * 3]!, dir[i * 3 + 1]!, dir[i * 3 + 2]!]
      expect(Math.hypot(x, y, z)).toBeCloseTo(1, 4)
      expect(Math.abs(y)).toBeLessThan(1e-6) // normal (0,1,0) → sin componente vertical
    }
  })

  it('las fibras dispersas empiezan por encima de la superficie', () => {
    const { start, end } = buildFiberAttributes(samples)
    for (let i = 0; i < samples.length; i++) expect(start[i * 3 + 1]!).toBeGreaterThan(end[i * 3 + 1]!)
  })

  it('el generador con semilla da valores en [0, 1)', () => {
    const rand = seededRandom(1)
    for (let i = 0; i < 1000; i++) {
      const v = rand()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('recuentos por nivel de la spec 08 §1.5', () => {
    expect(FIBER_COUNT).toEqual({ full: 6000, lite: 1500 })
  })
})

describe('contenido y configuración de la plantilla', () => {
  it('las capas del contenido coinciden con las de tools/blender/config/insole.json', () => {
    expect(insoleLayers.map((l) => l.id).sort()).toEqual(insoleConfig.layers.map((l) => l.id).sort())
  })

  it('etiquetas genéricas: no se nombran materiales ni procesos (spec 04 §2.2)', () => {
    expect(insoleLayers.map((l) => l.label)).toEqual(['Capa superior', 'Capa intermedia', 'Base'])
    const forbidden = /eva|poron|carbono|resina|espuma|silicona|cuero|termoform|impres|fresad|dureza|shore/i
    const texts = [
      ...insoleLayers.map((l) => l.label),
      ...fiberSteps.flatMap((s) => [s.title, typeof s.text === 'string' ? s.text : s.text.value]),
    ]
    for (const t of texts) expect(t).not.toMatch(forbidden)
    expect(CONCEPTUAL_LABEL).toBe('Representación conceptual')
  })

  it('la explosión respeta los límites de giro de la spec 08 §4.2', () => {
    expect(Math.abs(INSOLE_VIEW.explode.model_rotation_deg)).toBeLessThanOrEqual(10)
    expect(Math.abs(INSOLE_VIEW.explode.camera_orbit_deg)).toBeLessThanOrEqual(15)
  })

  it('la base termina en un borde curvo que no corta el tramo de adelgazamiento', () => {
    const z = insoleConfig.zones.rearfoot
    const fade = z.end - z.fade_start
    // u del borde delantero en el centro (v = 0) y en los lados (v = ±1)
    const edge = (v: number) => z.end - z.front_curve * v * v - z.front_skew * v
    expect(z.front_curve).toBeGreaterThan(0)
    expect(edge(-1)).toBeGreaterThan(edge(1)) // el lado interno llega más lejos
    for (const v of [-1, 0, 1]) {
      expect(edge(v)).toBeLessThanOrEqual(z.end)
      expect(edge(v) - fade).toBeGreaterThan(0.2) // el adelgazamiento empieza después de la copa del talón
    }
  })
})
