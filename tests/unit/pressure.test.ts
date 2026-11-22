import { describe, expect, it } from 'vitest'
import { biomechPhases, gaitCycle, pressureStates, runCycle } from '~/features/services/data/biomech'
import { FOCUS_KEYS, FOOT_H, FOOT_W, PRESSURE_RAMP, focusList, lerpState } from '~/utils/pressure'
import { collectPending } from '#shared/utils/pending'

describe('estados del mapa de presión', () => {
  const entries = Object.entries(pressureStates)

  it('todos tienen los mismos focos y en el mismo orden (interpolables)', () => {
    for (const [, state] of entries) {
      expect(Object.keys(state)).toEqual([...FOCUS_KEYS])
      expect(focusList(state)).toHaveLength(FOCUS_KEYS.length)
    }
  })

  it('entre 4 y 7 focos, como fija la spec 04 §1.4', () => {
    expect(FOCUS_KEYS.length).toBeGreaterThanOrEqual(4)
    expect(FOCUS_KEYS.length).toBeLessThanOrEqual(7)
  })

  it('intensidades en 0..1 y focos dentro de la huella', () => {
    for (const [name, state] of entries) {
      for (const f of focusList(state)) {
        expect(f.intensity, name).toBeGreaterThanOrEqual(0)
        expect(f.intensity, name).toBeLessThanOrEqual(1)
        expect(f.x, name).toBeGreaterThan(0)
        expect(f.x, name).toBeLessThan(FOOT_W)
        expect(f.y, name).toBeGreaterThan(0)
        expect(f.y, name).toBeLessThan(FOOT_H)
        expect(f.r, name).toBeGreaterThan(0)
      }
    }
  })

  it('idle está apagado y los ciclos de marcha usan estados existentes', () => {
    expect(focusList(pressureStates.idle).every((f) => f.intensity === 0)).toBe(true)
    for (const id of [...gaitCycle, ...runCycle]) expect(pressureStates[id]).toBeDefined()
  })
})

describe('lerpState', () => {
  const a = pressureStates.heelStrike
  const b = pressureStates.toeOff

  it('en los extremos devuelve los estados de origen y destino', () => {
    expect(lerpState(a, b, 0)).toEqual(a)
    expect(lerpState(a, b, 1)).toEqual(b)
  })

  it('a mitad de camino promedia posición, radio e intensidad', () => {
    const mid = lerpState(a, b, 0.5)
    expect(mid.heel.intensity).toBeCloseTo((a.heel.intensity + b.heel.intensity) / 2)
    expect(mid.hallux.r).toBeCloseTo((a.hallux.r + b.hallux.r) / 2)
    expect(mid.heel.x).toBeCloseTo((a.heel.x + b.heel.x) / 2)
  })

  it('limita t a 0..1', () => {
    expect(lerpState(a, b, -2)).toEqual(a)
    expect(lerpState(a, b, 5)).toEqual(b)
  })
})

describe('rampa de color', () => {
  it('6 paradas por canal, en 0..1, y transparente sin carga', () => {
    for (const channel of Object.values(PRESSURE_RAMP)) {
      expect(channel).toHaveLength(6)
      for (const v of channel) {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(1)
      }
    }
    expect(PRESSURE_RAMP.a[0]).toBe(0)
  })
})

describe('fases del estudio biomecánico', () => {
  it('son 6, numeradas 01-06 y con ids únicos', () => {
    expect(biomechPhases.map((p) => p.number)).toEqual(['01', '02', '03', '04', '05', '06'])
    expect(new Set(biomechPhases.map((p) => p.id)).size).toBe(6)
  })

  it('todo el texto clínico está marcado como pendiente de validar (spec 09 §4)', () => {
    const pending = collectPending(biomechPhases)
    expect(pending).toHaveLength(biomechPhases.length)
    expect(pending.every((p) => p.path.endsWith('.text'))).toBe(true)
  })

  it('la fase 06 enlaza con Plantillas personalizadas', () => {
    expect(biomechPhases[5]?.link?.to).toBe('/servicios/plantillas-personalizadas')
  })
})
