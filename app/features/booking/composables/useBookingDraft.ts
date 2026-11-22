/**
 * Borrador del wizard de cita en `sessionStorage` (spec 06 §2): sobrevive a recargas y al botón atrás
 * dentro de la sesión, **sin los consentimientos**, y se borra tras el envío correcto.
 * Nunca `localStorage` (el motivo puede ser un dato de salud).
 */
import { isBookingReason, TIME_SLOTS, type BookingReason, type TimeSlot } from '#shared/schemas/booking'

export interface BookingDraft {
  motivo: BookingReason | null
  primeraVisita: boolean | null
  franja: TimeSlot | null
  fechaPreferida: string
  nombre: string
  telefono: string
  email: string
}

export const DRAFT_KEY = 'vp-booking-draft'

export const emptyDraft = (): BookingDraft => ({
  motivo: null,
  primeraVisita: null,
  franja: null,
  fechaPreferida: '',
  nombre: '',
  telefono: '',
  email: '',
})

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.slice(0, max) : '')

/** Lee un borrador guardado descartando cualquier valor con forma inesperada. */
export function parseDraft(raw: string | null): BookingDraft {
  const draft = emptyDraft()
  if (!raw) return draft
  try {
    const data = JSON.parse(raw) as Record<string, unknown>
    draft.motivo = isBookingReason(data.motivo) ? data.motivo : null
    draft.primeraVisita = typeof data.primeraVisita === 'boolean' ? data.primeraVisita : null
    draft.franja = (TIME_SLOTS as readonly unknown[]).includes(data.franja) ? (data.franja as TimeSlot) : null
    draft.fechaPreferida = str(data.fechaPreferida, 10)
    draft.nombre = str(data.nombre, 80)
    draft.telefono = str(data.telefono, 30)
    draft.email = str(data.email, 120)
  } catch {
    /* borrador corrupto: se empieza de cero */
  }
  return draft
}

export function useBookingDraft() {
  const draft = reactive<BookingDraft>(emptyDraft())

  function load() {
    try {
      Object.assign(draft, parseDraft(sessionStorage.getItem(DRAFT_KEY)))
    } catch {
      /* sessionStorage no disponible */
    }
  }

  function save() {
    try {
      // Un borrador vacío (p. ej. justo después de enviar) no se guarda
      if (JSON.stringify(draft) === JSON.stringify(emptyDraft())) {
        sessionStorage.removeItem(DRAFT_KEY)
        return
      }
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch {
      /* sin almacenamiento: el wizard sigue funcionando sin borrador */
    }
  }

  function clear() {
    Object.assign(draft, emptyDraft())
    try {
      sessionStorage.removeItem(DRAFT_KEY)
    } catch {
      /* nada que borrar */
    }
  }

  return { draft, load, save, clear }
}
