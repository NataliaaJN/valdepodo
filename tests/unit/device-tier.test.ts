import { describe, expect, it } from 'vitest'
import { computeDeviceTier, type DeviceSignals } from '~/utils/device-tier'

const desktop: DeviceSignals = {
  webgl2: true,
  saveData: false,
  reducedMotion: false,
  contextLostBefore: false,
  viewportWidth: 1440,
  deviceMemory: 8,
  hardwareConcurrency: 8,
}

describe('computeDeviceTier', () => {
  it('escritorio capaz → full', () => {
    expect(computeDeviceTier(desktop)).toBe('full')
  })

  it.each<[string, Partial<DeviceSignals>]>([
    ['sin WebGL2', { webgl2: false }],
    ['ahorro de datos', { saveData: true }],
    ['movimiento reducido', { reducedMotion: true }],
    ['contexto perdido antes', { contextLostBefore: true }],
  ])('%s → static', (_, patch) => {
    expect(computeDeviceTier({ ...desktop, ...patch })).toBe('static')
  })

  it.each<[string, Partial<DeviceSignals>]>([
    ['viewport < 1024', { viewportWidth: 1023 }],
    ['móvil', { viewportWidth: 390 }],
    ['memoria ≤ 4 GB', { deviceMemory: 4 }],
    ['≤ 4 núcleos', { hardwareConcurrency: 4 }],
  ])('%s → lite', (_, patch) => {
    expect(computeDeviceTier({ ...desktop, ...patch })).toBe('lite')
  })

  it('sin pistas de hardware en escritorio → full', () => {
    expect(computeDeviceTier({ ...desktop, deviceMemory: undefined, hardwareConcurrency: undefined })).toBe(
      'full',
    )
  })
})
