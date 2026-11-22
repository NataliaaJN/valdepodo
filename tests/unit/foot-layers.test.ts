import { describe, expect, it } from 'vitest'
import { layerRoles } from '~/features/home/utils/foot-layers'

describe('layerRoles', () => {
  it('exterior activo: solo se ve la piel', () => {
    expect(layerRoles('skin')).toEqual({
      skin: 'active',
      bones: 'hidden',
      muscles: 'hidden',
      tendons: 'hidden',
      ligaments: 'hidden',
    })
  })

  it('capa interna activa: piel como contorno translúcido y huesos como contexto', () => {
    const roles = layerRoles('ligaments')
    expect(roles.skin).toBe('shell')
    expect(roles.bones).toBe('context')
    expect(roles.ligaments).toBe('active')
    expect(roles.muscles).toBe('hidden')
  })

  it('huesos activos no quedan como contexto de sí mismos', () => {
    expect(layerRoles('bones').bones).toBe('active')
  })

  it('músculos arrastran el tendón calcáneo; tendones muestran músculos atenuados', () => {
    expect(layerRoles('muscles').tendons).toBe('active')
    expect(layerRoles('tendons').muscles).toBe('context')
  })

  it('nunca hay dos capas en "shell" ni más de una capa interna oculta tras la piel opaca', () => {
    for (const active of ['skin', 'bones', 'muscles', 'tendons', 'ligaments'] as const) {
      const roles = Object.values(layerRoles(active))
      expect(roles.filter((r) => r === 'shell').length).toBeLessThanOrEqual(1)
      expect(roles).toContain('active')
    }
  })
})
