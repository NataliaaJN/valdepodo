/**
 * Destino de las solicitudes de cita (spec 06 §3). Hoy, correo; mañana, una agenda: basta con otra
 * implementación de `BookingSink` (p. ej. `AgendaApiBookingSink`) sin tocar la página ni el endpoint.
 */
import { randomBytes } from 'node:crypto'
import type { NormalizedBooking } from '#shared/schemas/booking'
import { clinicEmail, patientEmail, type ClinicContact } from './booking-email'
import type { Mailer } from './mailer'

export interface BookingSink {
  submit(booking: NormalizedBooking): Promise<{ id: string; acknowledged: boolean }>
}

/** Error al entregar la solicitud a la clínica: la solicitud NO se considera enviada (502). */
export class BookingDeliveryError extends Error {}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/** Referencia legible: `VP-251110-7KQ2`. */
export function createBookingId(now: Date = new Date()): string {
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' })
    .format(now)
    .replaceAll('-', '')
    .slice(2)
  const suffix = [...randomBytes(4)].map((b) => ALPHABET[b % ALPHABET.length]).join('')
  return `VP-${date}-${suffix}`
}

export function createEmailBookingSink(options: {
  mailer: Mailer
  clinicTo: string
  clinic: ClinicContact
  now?: () => Date
}): BookingSink {
  const now = options.now ?? (() => new Date())
  return {
    async submit(booking) {
      const receivedAt = now()
      const id = createBookingId(receivedAt)

      try {
        await options.mailer.send({
          to: options.clinicTo,
          replyTo: booking.email,
          ...clinicEmail(booking, id, receivedAt),
        })
      } catch (error) {
        throw new BookingDeliveryError(`No se pudo entregar la solicitud ${id}`, { cause: error })
      }

      // El acuse es secundario: si falla, la clínica ya tiene la solicitud
      let acknowledged = true
      try {
        await options.mailer.send({ to: booking.email, ...patientEmail(booking, id, options.clinic) })
      } catch {
        acknowledged = false
      }
      return { id, acknowledged }
    },
  }
}
