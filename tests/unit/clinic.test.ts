import { describe, expect, it } from 'vitest'
import { collectPending, isPending, resolveValue } from '#shared/utils/pending'
import { emptyDraft, parseDraft } from '~/composables/useBookingDraft'
import { reviews } from '~/data/reviews'
import { bookingPath, getService, services } from '~/data/services'
import { site, type WeeklyHours } from '~/data/site'
import { team } from '~/data/team'
import {
  earliestStep,
  failureMessage,
  firstIncompleteStep,
  validateStep,
  type WizardValues,
} from '~/utils/booking'
import { groupHours, madridClock, openStatus, openingHoursSchema, telHref, yearsSince } from '~/utils/clinic'

const week: WeeklyHours = [
  ...Array.from({ length: 5 }, () => [
    { open: '10:00', close: '13:30' },
    { open: '16:30', close: '20:00' },
  ]),
  [],
  [],
]

describe('años de experiencia', () => {
  it('se calculan desde el año de apertura', () => {
    expect(yearsSince(2017, new Date('2026-11-10'))).toBe(9)
    expect(yearsSince(2030, new Date('2026-11-10'))).toBe(0)
  })
})

describe('teléfono', () => {
  it('tel: internacional', () => {
    expect(telHref('687 50 69 27')).toBe('tel:+34687506927')
    expect(telHref('+44 20 7946 0958')).toBe('tel:+442079460958')
    expect(telHref('0034 600 000 000')).toBe('tel:+34600000000')
  })
})

describe('horario y "abierto ahora" (Europe/Madrid)', () => {
  // 10/11/2026 es martes; en noviembre Madrid está en UTC+1
  it('hora local de Madrid', () => {
    expect(madridClock(new Date('2026-11-10T10:00:00Z'))).toEqual({ day: 1, minutes: 11 * 60 })
  })

  it('abierto en franja de mañana y cerrado a mediodía', () => {
    expect(openStatus(week, new Date('2026-11-10T10:00:00Z'))).toEqual({
      open: true,
      next: { day: 1, time: '13:30' },
    })
    expect(openStatus(week, new Date('2026-11-10T13:00:00Z'))).toEqual({
      open: false,
      next: { day: 1, time: '16:30' },
    })
  })

  it('el viernes por la noche abre el lunes', () => {
    expect(openStatus(week, new Date('2026-11-13T20:30:00Z'))).toEqual({
      open: false,
      next: { day: 0, time: '10:00' },
    })
  })

  it('agrupa días consecutivos iguales', () => {
    expect(groupHours(week).map((r) => r.label)).toEqual(['Lunes a viernes', 'Sábado y domingo'])
  })

  it('openingHoursSpecification: dos franjas por día laborable', () => {
    const spec = openingHoursSchema(week)
    expect(spec).toHaveLength(10)
    expect(spec[0]).toMatchObject({ dayOfWeek: 'Monday', opens: '10:00', closes: '13:30' })
  })
})

describe('contenido (spec 09)', () => {
  it('los datos de contacto confirmados ya no son pendientes; el año de apertura sí', () => {
    for (const value of [site.phone, site.email, site.address.street, site.hours, site.instagram, site.linkedin]) {
      expect(isPending(value)).toBe(false)
    }
    expect(isPending(site.foundedYear)).toBe(true)
  })

  it('valores provisionales inequívocos en el equipo', () => {
    for (const member of team) {
      expect(resolveValue(member.name)).toBe('Nombre Apellido')
      expect(member.photo).toBeNull()
    }
  })

  it('sin reseñas inventadas', () => {
    expect(reviews).toHaveLength(0)
  })

  it('cada servicio tiene "Te ayuda si…", relacionados válidos y CTA con motivo', () => {
    for (const s of services) {
      expect(s.needs.length).toBeGreaterThanOrEqual(2)
      expect(s.needs.length).toBeLessThanOrEqual(4)
      for (const r of s.related) expect(getService(r).slug).not.toBe(s.slug)
      expect(bookingPath(s.slug)).toBe(`/contacto?motivo=${s.slug}#cita`)
    }
  })

  it('collectPending encuentra las notas del sitio', () => {
    expect(collectPending(site).length).toBeGreaterThan(2)
  })
})

describe('borrador del wizard (sessionStorage)', () => {
  it('descarta valores con forma inesperada y nunca guarda consentimientos', () => {
    const draft = parseDraft(
      JSON.stringify({
        motivo: 'hack',
        primeraVisita: 'si',
        franja: 'tarde',
        nombre: 'Ana',
        privacidad: true,
      }),
    )
    expect(draft).toEqual({ ...emptyDraft(), franja: 'tarde', nombre: 'Ana' })
    expect(draft).not.toHaveProperty('privacidad')
  })

  it('JSON corrupto → borrador vacío', () => {
    expect(parseDraft('{roto')).toEqual(emptyDraft())
  })
})

describe('lógica del wizard', () => {
  const empty: WizardValues = {
    motivo: null,
    primeraVisita: null,
    franja: null,
    fechaPreferida: '',
    nombre: '',
    telefono: '',
    email: '',
    privacidad: null,
    comunicaciones: false,
  }
  const full: WizardValues = {
    ...empty,
    motivo: 'otra',
    primeraVisita: false,
    franja: 'tarde',
    nombre: 'Ana Pérez',
    telefono: '612345678',
    email: 'ana@correo.com',
    privacidad: true,
  }

  it('primer paso incompleto', () => {
    expect(firstIncompleteStep(empty)).toBe(1)
    expect(firstIncompleteStep({ ...empty, motivo: 'otra' })).toBe(2)
    expect(firstIncompleteStep({ ...full, privacidad: null })).toBe(4)
    expect(firstIncompleteStep(full)).toBe(5)
  })

  it('valida solo los campos del paso', () => {
    expect(Object.keys(validateStep(1, empty))).toEqual(['motivo'])
    expect(validateStep(5, empty)).toEqual({})
  })

  it('vuelve al paso más temprano con errores del servidor', () => {
    expect(earliestStep({ email: 'x', franja: 'y' })).toBe(3)
    expect(earliestStep({})).toBe(5)
  })

  it('los mensajes de fallo ofrecen el teléfono y nunca confirman la cita', () => {
    for (const code of ['antispam', 'rate_limit', 'delivery', 'network'] as const) {
      const { title, text } = failureMessage(code)
      expect(`${title} ${text}`).not.toMatch(/confirmad/i)
      expect(text).toContain('{tel}')
    }
  })
})
