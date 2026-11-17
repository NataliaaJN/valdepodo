/**
 * Esquema único de la solicitud de cita (spec 06 §2-3): lo usan el wizard (validación por paso) y el
 * endpoint `/api/cita` (validación completa + normalización). Es una SOLICITUD, no una reserva.
 *
 * Minimización de datos: no hay texto libre sobre síntomas.
 */
import { z } from 'zod'

export const BOOKING_REASONS = [
  'estudio-biomecanico',
  'plantillas-personalizadas',
  'podologia-general',
  'podologia-infantil',
  'pie-diabetico',
  'otra',
] as const

export type BookingReason = (typeof BOOKING_REASONS)[number]

export const REASON_LABELS: Record<BookingReason, string> = {
  'estudio-biomecanico': 'Estudio biomecánico',
  'plantillas-personalizadas': 'Plantillas personalizadas',
  'podologia-general': 'Podología general',
  'podologia-infantil': 'Podología infantil',
  'pie-diabetico': 'Pie diabético',
  otra: 'Otra consulta',
}

export const TIME_SLOTS = ['manana', 'tarde', 'indiferente'] as const
export type TimeSlot = (typeof TIME_SLOTS)[number]

export const SLOT_LABELS: Record<TimeSlot, string> = {
  manana: 'Mañana',
  tarde: 'Tarde',
  indiferente: 'Indiferente',
}

export const isBookingReason = (value: unknown): value is BookingReason =>
  typeof value === 'string' && (BOOKING_REASONS as readonly string[]).includes(value)

/* ---------- Teléfono ---------- */

/**
 * Normaliza un teléfono español o internacional a E.164 (`+34612345678`). Devuelve `null` si no es válido.
 * - Nacional: 9 cifras que empiezan por 6, 7, 8 o 9.
 * - Internacional: `+` o `00` seguido de 8 a 15 cifras.
 */
export function normalizePhone(input: string): string | null {
  const compact = input.trim().replace(/[\s().-]/g, '')
  if (/^\+\d{8,15}$/.test(compact)) {
    return compact.startsWith('+34') && !/^\+34[6-9]\d{8}$/.test(compact) ? null : compact
  }
  if (/^00\d{8,15}$/.test(compact)) return normalizePhone(`+${compact.slice(2)}`)
  if (/^[6-9]\d{8}$/.test(compact)) return `+34${compact}`
  return null
}

/* ---------- Fecha orientativa ---------- */

/** Fecha "YYYY-MM-DD" en hora de Madrid, desplazada `days` días. */
export function madridDate(now: Date, days = 0): string {
  const shifted = new Date(now.getTime() + days * 86_400_000)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(shifted)
}

/** Rango permitido para la preferencia de fecha: de mañana a +90 días (spec 06 §2). */
export function preferredDateRange(now: Date = new Date()) {
  return { min: madridDate(now, 1), max: madridDate(now, 90) }
}

/* ---------- Esquemas por paso ---------- */

const required = (message: string) => ({ error: () => message })

export const stepSchemas = {
  1: z.object({
    motivo: z.enum(BOOKING_REASONS, required('Elige el motivo de tu consulta.')),
  }),
  2: z.object({
    primeraVisita: z.boolean(required('Indica si es tu primera visita.')),
  }),
  3: z.object({
    franja: z.enum(TIME_SLOTS, required('Elige tu preferencia horaria.')),
    fechaPreferida: z
      .string()
      .optional()
      .refine(
        (value) => {
          if (!value) return true
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
          const { min, max } = preferredDateRange()
          return value >= min && value <= max
        },
        { message: 'Elige una fecha entre mañana y los próximos 90 días.' },
      ),
  }),
  4: z.object({
    nombre: z
      .string(required('Escribe tu nombre.'))
      .trim()
      .min(2, 'Escribe tu nombre (al menos 2 caracteres).')
      .max(80, 'El nombre no puede superar los 80 caracteres.'),
    telefono: z
      .string(required('Escribe tu teléfono.'))
      .trim()
      .min(1, 'Escribe tu teléfono.')
      .refine((v) => normalizePhone(v) !== null, 'Escribe un teléfono válido, por ejemplo 612 345 678.'),
    email: z
      .string(required('Escribe tu email.'))
      .trim()
      .min(1, 'Escribe tu email.')
      .pipe(z.email('Escribe un email válido, por ejemplo nombre@correo.com.')),
    privacidad: z.literal(
      true,
      required('Debes aceptar la política de privacidad para enviar la solicitud.'),
    ),
    comunicaciones: z.boolean().default(false),
  }),
} as const

export type BookingStep = keyof typeof stepSchemas
export const BOOKING_STEPS = [1, 2, 3, 4] as const satisfies readonly BookingStep[]

/** Campos de la solicitud (lo que rellena la persona). */
export const bookingFieldsSchema = stepSchemas[1]
  .extend(stepSchemas[2].shape)
  .extend(stepSchemas[3].shape)
  .extend(stepSchemas[4].shape)

export type BookingFields = z.infer<typeof bookingFieldsSchema>

/** Cuerpo de `POST /api/cita`: campos + antispam. */
export const bookingRequestSchema = bookingFieldsSchema.extend({
  turnstileToken: z.string().max(4096).default(''),
  formToken: z.string().max(200),
  /** Honeypot: debe llegar vacío. */
  website: z.string().max(200).optional(),
})

export type BookingRequest = z.infer<typeof bookingRequestSchema>

/** Solicitud normalizada (trim, E.164, email en minúsculas) que llega al `BookingSink`. */
export interface NormalizedBooking {
  motivo: BookingReason
  primeraVisita: boolean
  franja: TimeSlot
  fechaPreferida: string | null
  nombre: string
  telefono: string
  email: string
  comunicaciones: boolean
}

export function normalizeBooking(fields: BookingFields): NormalizedBooking {
  return {
    motivo: fields.motivo,
    primeraVisita: fields.primeraVisita,
    franja: fields.franja,
    fechaPreferida: fields.fechaPreferida || null,
    nombre: fields.nombre.trim().replace(/\s+/g, ' '),
    telefono: normalizePhone(fields.telefono) ?? fields.telefono,
    email: fields.email.trim().toLowerCase(),
    comunicaciones: fields.comunicaciones,
  }
}

/** Paso del wizard al que pertenece cada campo (para devolver al paso afectado con errores del servidor). */
export const FIELD_STEP: Record<keyof BookingFields, BookingStep> = {
  motivo: 1,
  primeraVisita: 2,
  franja: 3,
  fechaPreferida: 3,
  nombre: 4,
  telefono: 4,
  email: 4,
  privacidad: 4,
  comunicaciones: 4,
}

export interface FieldIssue {
  field: string
  message: string
}

/** Convierte un error de Zod en una lista plana campo → mensaje (primer error por campo). */
export function flattenIssues(error: z.ZodError): FieldIssue[] {
  const seen = new Set<string>()
  const out: FieldIssue[] = []
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? '')
    if (seen.has(field)) continue
    seen.add(field)
    out.push({ field, message: issue.message })
  }
  return out
}

/* ---------- Respuestas de la API ---------- */

export interface BookingSuccess {
  ok: true
  id: string
  acknowledged: boolean
}

export type BookingErrorCode =
  'bad_request' | 'forbidden' | 'antispam' | 'validation' | 'rate_limit' | 'delivery' | 'not_configured'

export interface BookingFailure {
  ok: false
  error: BookingErrorCode
  issues?: FieldIssue[]
}

export type BookingResponse = BookingSuccess | BookingFailure
