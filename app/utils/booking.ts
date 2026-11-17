/**
 * Lógica pura del wizard de cita (spec 06 §2): validación por paso, primer paso incompleto, mensajes de
 * error de envío. Sin Vue, para probarla en aislado.
 */
import {
  BOOKING_STEPS,
  FIELD_STEP,
  flattenIssues,
  stepSchemas,
  type BookingErrorCode,
  type BookingFields,
  type BookingStep,
  type FieldIssue,
} from '#shared/schemas/booking'

export const TOTAL_STEPS = 5
export const STEP_TITLES = [
  'Motivo',
  'Primera visita',
  'Preferencia horaria',
  'Tus datos',
  'Resumen',
] as const

/** Valores del formulario tal y como los tiene el wizard (con huecos `null`). */
export type WizardValues = {
  [K in keyof BookingFields]: BookingFields[K] | null
}

export type FieldErrors = Partial<Record<keyof BookingFields, string>>

export function toFieldErrors(issues: readonly FieldIssue[]): FieldErrors {
  const out: FieldErrors = {}
  for (const issue of issues) {
    if (issue.field in FIELD_STEP) out[issue.field as keyof BookingFields] = issue.message
  }
  return out
}

/** Errores de un paso (vacío = válido). El paso 5 (resumen) no tiene campos propios. */
export function validateStep(step: number, values: WizardValues): FieldErrors {
  if (!(BOOKING_STEPS as readonly number[]).includes(step)) return {}
  const result = stepSchemas[step as BookingStep].safeParse(values)
  return result.success ? {} : toFieldErrors(flattenIssues(result.error))
}

/** Primer paso con errores; `TOTAL_STEPS` si todos los pasos de datos son válidos. */
export function firstIncompleteStep(values: WizardValues): number {
  for (const step of BOOKING_STEPS) {
    if (Object.keys(validateStep(step, values)).length) return step
  }
  return TOTAL_STEPS
}

/** Paso más temprano afectado por una lista de errores (p. ej. los devueltos por el servidor). */
export function earliestStep(errors: FieldErrors): number {
  const steps = Object.keys(errors).map((f) => FIELD_STEP[f as keyof BookingFields])
  return steps.length ? Math.min(...steps) : TOTAL_STEPS
}

export type SubmitFailure = BookingErrorCode | 'network'

/** Mensaje para cada fallo de envío (spec 06 §2, estados de envío). `{tel}` se sustituye en la vista. */
export function failureMessage(code: SubmitFailure): { title: string; text: string } {
  switch (code) {
    case 'antispam':
    case 'forbidden':
      return {
        title: 'No hemos podido verificar el envío',
        text: 'Inténtalo de nuevo o llámanos al {tel}.',
      }
    case 'rate_limit':
      return {
        title: 'Has enviado varias solicitudes seguidas',
        text: 'Espera unos minutos antes de volver a intentarlo o llámanos al {tel}.',
      }
    case 'validation':
      return {
        title: 'Revisa los datos del formulario',
        text: 'Hay algún campo que no hemos podido validar.',
      }
    default:
      return {
        title: 'No se ha podido enviar',
        text: 'Tus datos siguen aquí. Vuelve a intentarlo o, si lo prefieres, llámanos al {tel} o escríbenos.',
      }
  }
}
