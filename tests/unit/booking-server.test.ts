import { describe, expect, it, vi } from 'vitest'
import type { NormalizedBooking } from '#shared/schemas/booking'
import {
  MIN_FILL_MS,
  createFormToken,
  createRateLimiter,
  createTurnstileVerifier,
  isHoneypotFilled,
  verifyFormToken,
} from '~~/server/utils/antispam'
import { clinicEmail, patientEmail } from '~~/server/utils/booking-email'
import { handleBookingRequest, type BookingDeps, type BookingInput } from '~~/server/utils/booking-handler'
import { createBookingId, createEmailBookingSink, type BookingSink } from '~~/server/utils/booking-sink'
import type { Mailer, MailMessage } from '~~/server/utils/mailer'

const SECRET = 'secreto-de-pruebas'
const T0 = 1_700_000_000_000

describe('token del formulario (HMAC + tiempo mínimo)', () => {
  const token = createFormToken(SECRET, T0)

  it('es válido pasado el tiempo mínimo', () => {
    expect(verifyFormToken(token, SECRET, T0 + MIN_FILL_MS)).toBe('ok')
  })
  it('rechaza envíos demasiado rápidos', () => {
    expect(verifyFormToken(token, SECRET, T0 + 500)).toBe('too_fast')
  })
  it('rechaza tokens caducados', () => {
    expect(verifyFormToken(token, SECRET, T0 + 3 * 60 * 60 * 1000)).toBe('expired')
  })
  it('rechaza firmas falsificadas o de otro secreto', () => {
    const [ts] = token.split('.')
    expect(verifyFormToken(`${Number(ts) - 60_000}.${token.split('.')[1]}`, SECRET, T0 + 5_000)).toBe(
      'invalid',
    )
    expect(verifyFormToken(createFormToken('otro', T0), SECRET, T0 + 5_000)).toBe('invalid')
    expect(verifyFormToken('basura', SECRET, T0)).toBe('invalid')
  })
})

describe('antispam', () => {
  it('honeypot', () => {
    expect(isHoneypotFilled('')).toBe(false)
    expect(isHoneypotFilled(undefined)).toBe(false)
    expect(isHoneypotFilled('https://spam')).toBe(true)
  })

  it('límite de 5 solicitudes por ventana', () => {
    const limiter = createRateLimiter({ limit: 5, windowMs: 600_000 })
    const results = Array.from({ length: 6 }, () => limiter.hit('1.2.3.4', T0))
    expect(results).toEqual([true, true, true, true, true, false])
    expect(limiter.hit('5.6.7.8', T0)).toBe(true)
    expect(limiter.hit('1.2.3.4', T0 + 600_001)).toBe(true)
  })

  it('Turnstile: pregunta a Cloudflare y respeta su respuesta', async () => {
    const fetchImpl = vi.fn(
      async () => new Response(JSON.stringify({ success: true })),
    ) as unknown as typeof fetch
    const verify = createTurnstileVerifier('s', fetchImpl)
    expect(await verify('token', '1.2.3.4')).toBe(true)
    expect(await verify('', '1.2.3.4')).toBe(false)
    const failing = createTurnstileVerifier('s', (async () => {
      throw new Error('red')
    }) as unknown as typeof fetch)
    expect(await failing('token', undefined)).toBe(false)
  })
})

const booking: NormalizedBooking = {
  motivo: 'pie-diabetico',
  primeraVisita: false,
  franja: 'manana',
  fechaPreferida: '2026-12-01',
  nombre: 'Ana <b>Pérez</b>',
  telefono: '+34612345678',
  email: 'ana@correo.com',
  comunicaciones: false,
}
const clinic = {
  name: 'Valdepodo',
  phone: '600 000 000',
  email: 'clinica@example.invalid',
  privacyUrl: 'https://example.invalid/privacidad',
  responseTime: '48 horas',
}

describe('correos', () => {
  it('a la clínica: asunto con motivo y nombre, HTML escapado', () => {
    const mail = clinicEmail(booking, 'VP-1', new Date(T0))
    expect(mail.subject).toBe('Nueva solicitud de cita · Pie diabético · Ana <b>Pérez</b>')
    expect(mail.html).toContain('Ana &lt;b&gt;Pérez&lt;/b&gt;')
    expect(mail.html).not.toContain('<b>Pérez')
    expect(mail.text).toContain('Fecha orientativa: 01/12/2026')
  })

  it('acuse al paciente: nunca dice "cita confirmada" y avisa de que no lo es', () => {
    const mail = patientEmail(booking, 'VP-1', clinic)
    expect(mail.text).toContain('todavía no es una cita confirmada')
    expect(mail.text.toLowerCase()).not.toMatch(/tu cita (está|ha sido) confirmada/)
    expect(mail.html).not.toMatch(/<img/i)
  })

  it('referencia legible', () => {
    expect(createBookingId(new Date('2026-11-10T12:00:00Z'))).toMatch(/^VP-261110-[A-Z2-9]{4}$/)
  })
})

describe('EmailBookingSink', () => {
  const mailer = (fail: (m: MailMessage) => boolean): Mailer & { sent: MailMessage[] } => {
    const sent: MailMessage[] = []
    return {
      sent,
      async send(m) {
        if (fail(m)) throw new Error('fallo')
        sent.push(m)
      },
    }
  }

  it('envía a la clínica (reply-to paciente) y el acuse', async () => {
    const m = mailer(() => false)
    const sink = createEmailBookingSink({ mailer: m, clinicTo: 'c@x.invalid', clinic })
    const res = await sink.submit(booking)
    expect(res.acknowledged).toBe(true)
    expect(m.sent.map((s) => s.to)).toEqual(['c@x.invalid', 'ana@correo.com'])
    expect(m.sent[0]!.replyTo).toBe('ana@correo.com')
  })

  it('si falla el acuse, la solicitud cuenta como enviada', async () => {
    const m = mailer((msg) => msg.to === 'ana@correo.com')
    const res = await createEmailBookingSink({ mailer: m, clinicTo: 'c@x.invalid', clinic }).submit(booking)
    expect(res.acknowledged).toBe(false)
  })

  it('si falla el correo a la clínica, lanza error', async () => {
    const m = mailer((msg) => msg.to === 'c@x.invalid')
    await expect(
      createEmailBookingSink({ mailer: m, clinicTo: 'c@x.invalid', clinic }).submit(booking),
    ).rejects.toThrow()
  })
})

describe('POST /api/cita (handleBookingRequest)', () => {
  const body = (patch: Record<string, unknown> = {}) =>
    JSON.stringify({
      motivo: 'podologia-general',
      primeraVisita: true,
      franja: 'indiferente',
      nombre: 'Ana Pérez',
      telefono: '612345678',
      email: 'ana@correo.com',
      privacidad: true,
      comunicaciones: false,
      turnstileToken: 'ok',
      formToken: createFormToken(SECRET, T0),
      website: '',
      ...patch,
    })

  const input = (patch: Partial<BookingInput> = {}): BookingInput => ({
    contentType: 'application/json',
    origin: 'https://valdepodo.test',
    host: 'valdepodo.test',
    ip: '1.2.3.4',
    rawBody: body(),
    ...patch,
  })

  const deps = (patch: Partial<BookingDeps> = {}): BookingDeps & { submitted: NormalizedBooking[] } => {
    const submitted: NormalizedBooking[] = []
    const sink: BookingSink = {
      async submit(b) {
        submitted.push(b)
        return { id: 'VP-TEST', acknowledged: true }
      },
    }
    return {
      submitted,
      sink,
      formSecret: SECRET,
      turnstile: async (token) => token === 'ok',
      rateLimit: { hit: () => true },
      allowedOrigins: ['https://valdepodo.test'],
      now: () => T0 + 10_000,
      ...patch,
    }
  }

  it('200 con id y solicitud normalizada', async () => {
    const d = deps()
    const res = await handleBookingRequest(input(), d)
    expect(res).toEqual({ status: 200, body: { ok: true, id: 'VP-TEST', acknowledged: true } })
    expect(d.submitted[0]).toMatchObject({ telefono: '+34612345678', nombre: 'Ana Pérez' })
  })

  it('422 con los campos afectados', async () => {
    const res = await handleBookingRequest(input({ rawBody: body({ email: 'mal', telefono: '1' }) }), deps())
    expect(res.status).toBe(422)
    expect(res.body.ok === false && res.body.issues?.map((i) => i.field)).toEqual(['telefono', 'email'])
  })

  it('403 por honeypot, token rápido, token falso o Turnstile', async () => {
    expect((await handleBookingRequest(input({ rawBody: body({ website: 'x' }) }), deps())).status).toBe(403)
    expect((await handleBookingRequest(input(), deps({ now: () => T0 + 1_000 }))).status).toBe(403)
    expect((await handleBookingRequest(input({ rawBody: body({ formToken: '1.2' }) }), deps())).status).toBe(
      403,
    )
    expect(
      (await handleBookingRequest(input({ rawBody: body({ turnstileToken: 'no' }) }), deps())).status,
    ).toBe(403)
  })

  it('403 si el origen no es el propio', async () => {
    const res = await handleBookingRequest(input({ origin: 'https://otro.example' }), deps())
    expect(res).toEqual({ status: 403, body: { ok: false, error: 'forbidden' } })
  })

  it('sin lista de orígenes, acepta el mismo host', async () => {
    const res = await handleBookingRequest(
      input({ origin: 'http://localhost:3000', host: 'localhost:3000' }),
      deps({ allowedOrigins: [] }),
    )
    expect(res.status).toBe(200)
  })

  it('429 al superar el límite', async () => {
    const res = await handleBookingRequest(input(), deps({ rateLimit: { hit: () => false } }))
    expect(res.status).toBe(429)
  })

  it('502 si no se puede entregar a la clínica', async () => {
    const sink: BookingSink = {
      async submit() {
        throw new Error('proveedor caído')
      },
    }
    const res = await handleBookingRequest(input(), deps({ sink }))
    expect(res).toEqual({ status: 502, body: { ok: false, error: 'delivery' } })
  })

  it('415/413/400 por forma de la petición y 503 sin configuración', async () => {
    expect((await handleBookingRequest(input({ contentType: 'text/plain' }), deps())).status).toBe(415)
    expect((await handleBookingRequest(input({ rawBody: 'x'.repeat(11_000) }), deps())).status).toBe(413)
    expect((await handleBookingRequest(input({ rawBody: '{roto' }), deps())).status).toBe(400)
    expect((await handleBookingRequest(input(), deps({ sink: null }))).status).toBe(503)
  })

  it('los logs no llevan datos personales', async () => {
    const entries: string[] = []
    await handleBookingRequest(input(), deps({ log: (e) => entries.push(JSON.stringify(e)) }))
    await handleBookingRequest(
      input({ rawBody: body({ email: 'mal' }) }),
      deps({ log: (e) => entries.push(JSON.stringify(e)) }),
    )
    const all = entries.join('\n')
    expect(all).not.toMatch(/Ana|612345678|correo\.com/)
    expect(all).toContain('VP-TEST')
  })
})
