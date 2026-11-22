import { describe, expect, it } from 'vitest'
import {
  buildStepTable,
  pitchAt,
  sampleStep,
  soleProfile,
  STEP_CONTACT,
  type SolePoint,
} from '~/features/home/utils/foot-step'

// Suela sintética parecida a la del GLB: talón (z −0.09) a 2 mm, antepié (z 0.03) a 0, dedos hasta 0.10
const sole: SolePoint[] = Array.from({ length: 21 }, (_, i) => {
  const z = -0.12 + (0.224 * i) / 20
  const y =
    z < -0.05
      ? 0.002 + Math.abs(z + 0.09) * 0.1
      : z < 0.04
        ? Math.max(0, (-0.01 - z) * 0.05)
        : 0.002 + (z - 0.04) * 0.06
  return { x: 0, y, z }
})
const table = buildStepTable(sole)

describe('paso del pie (scroll → progress)', () => {
  it('en 0 el pie está como en la composición actual, algo elevado', () => {
    const p = sampleStep(table, 0)
    expect(p.theta).toBe(0)
    expect(p.y).toBeCloseTo(0)
    expect(p.z).toBeCloseTo(0)
    expect(p.near).toBeCloseTo(0)
    expect(p.press).toBe(0)
  })

  it('el cabeceo pasa de puntera arriba (talón) a talón arriba (impulso) sin rebotes', () => {
    expect(pitchAt(STEP_CONTACT)).toBeLessThan(0)
    expect(pitchAt(1)).toBeGreaterThan(0.2)
    // El mínimo es el contacto y desde ahí solo crece
    for (let p = STEP_CONTACT; p < 1; p += 0.005)
      expect(pitchAt(p + 0.005)).toBeGreaterThanOrEqual(pitchAt(p) - 1e-9)
    for (let p = 0; p < STEP_CONTACT; p += 0.005)
      expect(pitchAt(p + 0.005)).toBeLessThanOrEqual(pitchAt(p) + 1e-9)
  })

  it('el talón es el primer punto de apoyo y la suela nunca atraviesa el suelo', () => {
    const contact = sampleStep(table, STEP_CONTACT + 0.01)
    expect(contact.contactZ).toBeLessThan(0) // talón: parte trasera
    expect(contact.press).toBeGreaterThan(0)
    for (let p = 0; p <= 1; p += 0.01) {
      const s = sampleStep(table, p)
      const c = Math.cos(s.theta)
      const sn = Math.sin(s.theta)
      for (const pt of sole.filter((q) => q.z <= -0.12 + 0.224 * 0.8)) {
        expect(pt.y * c - pt.z * sn + s.y).toBeGreaterThanOrEqual(table.floorY - 1e-6)
      }
    }
  })

  it('el apoyo termina en el antepié', () => {
    expect(sampleStep(table, 1).contactZ).toBeGreaterThan(0)
  })

  it('movimiento continuo: sin saltos entre muestras vecinas', () => {
    for (let p = 0; p < 1; p += 0.002) {
      const a = sampleStep(table, p)
      const b = sampleStep(table, p + 0.002)
      expect(Math.abs(b.theta - a.theta)).toBeLessThan(0.01)
      expect(Math.abs(b.y - a.y)).toBeLessThan(0.002)
      expect(Math.abs(b.z - a.z)).toBeLessThan(0.002)
    }
  })

  it('el movimiento es moderado: el pie no abandona la composición', () => {
    for (let p = 0; p <= 1; p += 0.02) {
      const s = sampleStep(table, p)
      expect(Math.abs(s.z)).toBeLessThan(table.length * 0.35)
      expect(Math.abs(s.y)).toBeLessThan(table.length * 0.3)
    }
  })

  it('soleProfile devuelve el punto más bajo de cada franja', () => {
    const verts = [0, 5, 0, 0, 1, 0.01, 0, 3, 1, 0, 2, 0.99]
    const prof = soleProfile(verts, 2)
    expect(prof.map((p) => p.y)).toEqual([1, 2])
  })
})
