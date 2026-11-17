/**
 * Utilidades puras sobre los datos de la clínica (spec 07, spec 10 §5: "años de experiencia" y
 * "abierto ahora" con pruebas unitarias).
 */
import type { OpeningSlot, WeeklyHours } from '~/data/site'

export const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const
const SCHEMA_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const

/** Años completos desde la apertura (la cifra de "9 años", spec 03 §3). Nunca negativo. */
export function yearsSince(foundedYear: number, now: Date = new Date()): number {
  return Math.max(0, now.getFullYear() - foundedYear)
}

/** `tel:` en formato internacional a partir del número mostrado (España por defecto). */
export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return `tel:${digits}`
  if (digits.startsWith('00')) return `tel:+${digits.slice(2)}`
  return `tel:+34${digits}`
}

export function directionsUrl(geo: { lat: number; lng: number }): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${geo.lat},${geo.lng}`
}

/** Mapa embebido sin clave (spec 07 §3): ubicación exacta con marcador. */
export function mapEmbedUrl(geo: { lat: number; lng: number }, zoom = 17): string {
  return `https://maps.google.com/maps?q=${geo.lat},${geo.lng}&z=${zoom}&output=embed&hl=es`
}

const toMinutes = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Hora local de Madrid (día 0 = lunes y minutos desde medianoche) para un instante dado. */
export function madridClock(date: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(get('weekday'))
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

export interface OpenStatus {
  open: boolean
  /** Hora de cierre de la franja actual o de apertura de la siguiente ("HH:MM"), con su día. */
  next: { day: number; time: string } | null
}

/** "Abierto ahora / Cerrado" con la zona Europe/Madrid (spec 07 §2). */
export function openStatus(hours: WeeklyHours, date: Date = new Date()): OpenStatus {
  const { day, minutes } = madridClock(date)
  const today = hours[day] ?? []
  const current = today.find((s) => minutes >= toMinutes(s.open) && minutes < toMinutes(s.close))
  if (current) return { open: true, next: { day, time: current.close } }

  for (let offset = 0; offset < 7; offset++) {
    const d = (day + offset) % 7
    const slot = (hours[d] ?? []).find((s) => offset > 0 || toMinutes(s.open) > minutes)
    if (slot) return { open: false, next: { day: d, time: slot.open } }
  }
  return { open: false, next: null }
}

/** Filas de horario agrupando días consecutivos iguales ("Lunes a viernes"). */
export function groupHours(hours: WeeklyHours): { label: string; slots: readonly OpeningSlot[] }[] {
  const key = (slots: readonly OpeningSlot[]) => slots.map((s) => `${s.open}-${s.close}`).join(',')
  const rows: { from: number; to: number; slots: readonly OpeningSlot[] }[] = []
  hours.forEach((slots, i) => {
    const last = rows.at(-1)
    if (last && key(last.slots) === key(slots) && last.to === i - 1) last.to = i
    else rows.push({ from: i, to: i, slots })
  })
  return rows.map((r) => ({
    label:
      r.from === r.to
        ? DAY_NAMES[r.from]!
        : r.to === r.from + 1
          ? `${DAY_NAMES[r.from]} y ${DAY_NAMES[r.to]!.toLowerCase()}`
          : `${DAY_NAMES[r.from]} a ${DAY_NAMES[r.to]!.toLowerCase()}`,
    slots: r.slots,
  }))
}

/** `openingHoursSpecification` de schema.org. */
export function openingHoursSchema(hours: WeeklyHours) {
  return hours.flatMap((slots, i) =>
    slots.map((s) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: SCHEMA_DAYS[i],
      opens: s.open,
      closes: s.close,
    })),
  )
}
