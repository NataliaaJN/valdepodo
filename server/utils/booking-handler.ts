/**
 * Lógica de `POST /api/cita` sin dependencias de h3 (spec 06 §3), para poder probarla con dobles de
 * `BookingSink`, Turnstile y reloj. El endpoint solo traduce la petición HTTP a `BookingInput`.
 *
 * Orden: forma de la petición (JSON, < 10 KB, origen) → límite por IP → antispam (honeypot, token firmado,
 * Turnstile) → validación y normalización → entrega. Los logs no llevan datos personales.
 */
import {
  bookingRequestSchema,
  flattenIssues,
  normalizeBooking,
  type BookingFailure,
  type BookingResponse,
} from '#shared/schemas/booking'
import { isHoneypotFilled, verifyFormToken, type TurnstileVerifier } from './antispam'
import { BookingDeliveryError, type BookingSink } from './booking-sink'

export const MAX_BODY_BYTES = 10 * 1024

export interface BookingInput {
  contentType: string | undefined
  origin: string | undefined
  host: string | undefined
  ip: string | undefined
  rawBody: string | undefined
}

export interface BookingDeps {
  sink: BookingSink | null
  formSecret: string
  /** `null` = Turnstile desactivado (solo fuera de producción). */
  turnstile: TurnstileVerifier | null
  rateLimit: { hit(key: string): boolean }
  /** Orígenes permitidos (p. ej. `https://valdepodo.es`). Vacío = mismo host que la petición. */
  allowedOrigins: string[]
  now?: () => number
  log?: (entry: Record<string, unknown>) => void
}

export interface BookingResult {
  status: number
  body: BookingResponse
}

const fail = (
  status: number,
  error: BookingFailure['error'],
  issues?: BookingFailure['issues'],
): BookingResult => ({
  status,
  body: issues ? { ok: false, error, issues } : { ok: false, error },
})

function originAllowed(origin: string | undefined, host: string | undefined, allowed: string[]): boolean {
  if (!origin) return false
  try {
    const url = new URL(origin)
    if (allowed.length) return allowed.some((a) => new URL(a).origin === url.origin)
    return url.host === host
  } catch {
    return false
  }
}

export async function handleBookingRequest(input: BookingInput, deps: BookingDeps): Promise<BookingResult> {
  const now = deps.now ?? Date.now
  const log = deps.log ?? (() => {})

  // 1. Forma de la petición
  if (!input.contentType?.toLowerCase().startsWith('application/json')) return fail(415, 'bad_request')
  const raw = input.rawBody ?? ''
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) return fail(413, 'bad_request')
  if (!originAllowed(input.origin, input.host, deps.allowedOrigins)) return fail(403, 'forbidden')
  if (!deps.sink || !deps.formSecret) {
    log({ event: 'booking', result: 'not_configured' })
    return fail(503, 'not_configured')
  }

  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return fail(400, 'bad_request')
  }

  // 2. Límite por IP
  if (!deps.rateLimit.hit(input.ip ?? 'unknown')) {
    log({ event: 'booking', result: 'rate_limit' })
    return fail(429, 'rate_limit')
  }

  // 3. Antispam (antes de validar: no se da información a un bot)
  const body = (typeof json === 'object' && json !== null ? json : {}) as Record<string, unknown>
  if (isHoneypotFilled(typeof body.website === 'string' ? body.website : undefined)) {
    log({ event: 'booking', result: 'antispam', reason: 'honeypot' })
    return fail(403, 'antispam')
  }
  const tokenCheck = verifyFormToken(
    typeof body.formToken === 'string' ? body.formToken : '',
    deps.formSecret,
    now(),
  )
  if (tokenCheck !== 'ok') {
    log({ event: 'booking', result: 'antispam', reason: tokenCheck })
    return fail(403, 'antispam')
  }
  if (deps.turnstile) {
    const token = typeof body.turnstileToken === 'string' ? body.turnstileToken : ''
    if (!(await deps.turnstile(token, input.ip))) {
      log({ event: 'booking', result: 'antispam', reason: 'turnstile' })
      return fail(403, 'antispam')
    }
  }

  // 4. Validación y normalización
  const parsed = bookingRequestSchema.safeParse(json)
  if (!parsed.success) {
    const issues = flattenIssues(parsed.error)
    log({ event: 'booking', result: 'validation', fields: issues.map((i) => i.field) })
    return fail(422, 'validation', issues)
  }
  const booking = normalizeBooking(parsed.data)

  // 5. Entrega
  try {
    const { id, acknowledged } = await deps.sink.submit(booking)
    log({ event: 'booking', result: 'ok', id, motivo: booking.motivo, acknowledged })
    return { status: 200, body: { ok: true, id, acknowledged } }
  } catch (error) {
    log({
      event: 'booking',
      result: 'delivery_error',
      motivo: booking.motivo,
      message: error instanceof BookingDeliveryError ? error.message : 'error inesperado',
    })
    return fail(502, 'delivery')
  }
}
