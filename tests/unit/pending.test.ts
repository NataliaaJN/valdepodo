import { describe, expect, it } from 'vitest'
import { collectPending, isPending, pending, resolveValue } from '#shared/utils/pending'

describe('pending()', () => {
  it('marca y resuelve valores provisionales', () => {
    const phone = pending('+34 000 000 000', 'Teléfono real de la clínica')
    expect(isPending(phone)).toBe(true)
    expect(resolveValue(phone)).toBe('+34 000 000 000')
    expect(resolveValue('confirmado')).toBe('confirmado')
    expect(isPending('confirmado')).toBe(false)
    expect(isPending(null as unknown as string)).toBe(false)
  })

  it('localiza todos los marcadores con su ruta', () => {
    const content = {
      name: 'Valdepodo',
      contact: { phone: pending('x', 'Teléfono'), email: 'ok@example.com' },
      team: [{ name: pending('Nombre Apellido', 'Nombre real') }, { name: 'Confirmado' }],
    }
    expect(collectPending(content)).toEqual([
      { path: 'contact.phone', note: 'Teléfono' },
      { path: 'team[0].name', note: 'Nombre real' },
    ])
  })

  it('devuelve lista vacía cuando no hay pendientes', () => {
    expect(collectPending({ a: 1, b: ['x', { c: true }] })).toEqual([])
  })
})
