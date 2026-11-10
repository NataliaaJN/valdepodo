import { describe, expect, it } from 'vitest'
import {
  bookingFieldsSchema,
  bookingRequestSchema,
  flattenIssues,
  normalizeBooking,
  normalizePhone,
  preferredDateRange,
  stepSchemas,
} from '#shared/schemas/booking'

const valid = {
  motivo: 'estudio-biomecanico',
  primeraVisita: true,
  franja: 'tarde',
  fechaPreferida: '',
  nombre: '  Ana   Pérez ',
  telefono: '612 34 56 78',
  email: ' Ana@Correo.COM ',
  privacidad: true,
  comunicaciones: false,
}

describe('normalizePhone (spec 06 §3: E.164)', () => {
  it.each([
    ['612345678', '+34612345678'],
    ['612 34 56 78', '+34612345678'],
    ['912-345-678', '+34912345678'],
    ['+34 612 345 678', '+34612345678'],
    ['0034612345678', '+34612345678'],
    ['+44 20 7946 0958', '+442079460958'],
  ])('%s → %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected)
  })

  it.each(['12345', '512345678', '+34 512 345 678', 'abc', '', '+1234'])('rechaza %s', (input) => {
    expect(normalizePhone(input)).toBeNull()
  })
})

describe('esquema de la solicitud (spec 06 §2)', () => {
  it('acepta una solicitud completa', () => {
    expect(bookingFieldsSchema.safeParse(valid).success).toBe(true)
  })

  it('exige el consentimiento de privacidad', () => {
    const result = bookingFieldsSchema.safeParse({ ...valid, privacidad: false })
    expect(result.success).toBe(false)
    expect(flattenIssues(result.error!)[0]).toMatchObject({ field: 'privacidad' })
  })

  it('las comunicaciones son opcionales y por defecto no', () => {
    const { comunicaciones: _omit, ...rest } = valid
    const result = bookingFieldsSchema.safeParse(rest)
    expect(result.success && result.data.comunicaciones).toBe(false)
  })

  it.each([
    [1, { motivo: null }, 'motivo'],
    [1, { motivo: 'cirugia' }, 'motivo'],
    [2, { primeraVisita: null }, 'primeraVisita'],
    [3, { franja: 'noche' }, 'franja'],
    [4, { nombre: 'A' }, 'nombre'],
    [4, { telefono: '123' }, 'telefono'],
    [4, { email: 'ana@' }, 'email'],
  ] as const)('paso %i: %o no es válido (%s)', (step, patch, field) => {
    const result = stepSchemas[step].safeParse({ ...valid, ...patch })
    expect(result.success).toBe(false)
    expect(flattenIssues(result.error!).map((i) => i.field)).toContain(field)
  })

  it('mensajes en español y uno por campo', () => {
    const result = stepSchemas[4].safeParse({ nombre: '', telefono: '', email: '', privacidad: false })
    const issues = flattenIssues(result.error!)
    expect(issues.map((i) => i.field)).toEqual(['nombre', 'telefono', 'email', 'privacidad'])
    expect(issues.every((i) => /[a-záéíóú]/i.test(i.message) && !/expected/i.test(i.message))).toBe(true)
  })

  it('la fecha orientativa va de mañana a +90 días', () => {
    const { min, max } = preferredDateRange()
    expect(stepSchemas[3].safeParse({ franja: 'manana', fechaPreferida: min }).success).toBe(true)
    expect(stepSchemas[3].safeParse({ franja: 'manana', fechaPreferida: max }).success).toBe(true)
    expect(stepSchemas[3].safeParse({ franja: 'manana', fechaPreferida: '2000-01-01' }).success).toBe(false)
    expect(stepSchemas[3].safeParse({ franja: 'manana', fechaPreferida: '2999-01-01' }).success).toBe(false)
    expect(stepSchemas[3].safeParse({ franja: 'manana', fechaPreferida: 'mañana' }).success).toBe(false)
  })

  it('no admite texto libre sobre síntomas (minimización de datos)', () => {
    const result = bookingRequestSchema.parse({ ...valid, formToken: 'x', sintomas: 'dolor' })
    expect(result).not.toHaveProperty('sintomas')
  })
})

describe('normalizeBooking', () => {
  it('recorta, normaliza teléfono y pasa el email a minúsculas', () => {
    const booking = normalizeBooking(bookingFieldsSchema.parse(valid))
    expect(booking).toMatchObject({
      nombre: 'Ana Pérez',
      telefono: '+34612345678',
      email: 'ana@correo.com',
      fechaPreferida: null,
    })
    expect(booking).not.toHaveProperty('privacidad')
  })
})
