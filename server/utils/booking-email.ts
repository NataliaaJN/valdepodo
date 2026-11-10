/**
 * Plantillas de correo de la solicitud de cita (spec 06 §3.4). HTML sencillo con estilos en línea + texto.
 * - A la clínica: todos los campos, referencia y fecha de recepción; `reply-to` = paciente.
 * - Acuse al paciente: "Hemos recibido tu solicitud", resumen y aviso de que **no es una cita confirmada**.
 *   Sin datos de otros pacientes ni píxeles de seguimiento.
 */
import { REASON_LABELS, SLOT_LABELS, type NormalizedBooking } from '#shared/schemas/booking'

export interface ClinicContact {
  name: string
  phone: string
  email: string
  privacyUrl: string
  responseTime: string
}

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  )

function formatDate(iso: string | null): string {
  if (!iso) return 'Sin preferencia'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function formatReceived(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date)
}

function rows(b: NormalizedBooking): [string, string][] {
  return [
    ['Motivo', REASON_LABELS[b.motivo]],
    ['Primera visita', b.primeraVisita ? 'Sí' : 'No'],
    ['Preferencia horaria', SLOT_LABELS[b.franja]],
    ['Fecha orientativa', formatDate(b.fechaPreferida)],
    ['Nombre', b.nombre],
    ['Teléfono', b.telefono],
    ['Email', b.email],
  ]
}

function layout(title: string, inner: string): string {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f5f8fc;font-family:Arial,Helvetica,sans-serif;color:#24364b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f8fc;padding:24px 0"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;padding:32px">
<tr><td><p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#0b5e99;font-weight:bold">Valdepodo</p>
<h1 style="margin:0 0 16px;font-size:24px;color:#163c63">${escapeHtml(title)}</h1>${inner}</td></tr></table>
</td></tr></table></body></html>`
}

function table(b: NormalizedBooking): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0">${rows(
    b,
  )
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #dce8ef;color:#617386;width:45%">${escapeHtml(k)}</td><td style="padding:8px 0;border-bottom:1px solid #dce8ef;font-weight:bold">${escapeHtml(v)}</td></tr>`,
    )
    .join('')}</table>`
}

const textTable = (b: NormalizedBooking) =>
  rows(b)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')

export function clinicEmail(b: NormalizedBooking, id: string, receivedAt: Date) {
  const subject = `Nueva solicitud de cita · ${REASON_LABELS[b.motivo]} · ${b.nombre}`
  const meta = `Referencia ${id} · recibida el ${formatReceived(receivedAt)}`
  const comms = b.comunicaciones
    ? 'Acepta comunicaciones comerciales.'
    : 'No acepta comunicaciones comerciales.'
  const html = layout(
    'Nueva solicitud de cita',
    `<p style="margin:0;color:#617386">${escapeHtml(meta)}</p>${table(b)}
<p style="margin:0;color:#617386;font-size:14px">${escapeHtml(comms)} Puedes responder a este correo para escribir a la persona.</p>
<p style="margin:16px 0 0;color:#617386;font-size:14px">Es una solicitud: hay que contactar con la persona para confirmar día y hora.</p>`,
  )
  const text = `Nueva solicitud de cita\n${meta}\n\n${textTable(b)}\n\n${comms}\nEs una solicitud: hay que contactar con la persona para confirmar día y hora.`
  return { subject, html, text }
}

export function patientEmail(b: NormalizedBooking, id: string, clinic: ClinicContact) {
  const subject = 'Hemos recibido tu solicitud de cita · Valdepodo'
  const intro = `Hola, ${b.nombre}. Hemos recibido tu solicitud. Te contactaremos en ${clinic.responseTime} para confirmar el día y la hora.`
  const notice = 'Importante: todavía no es una cita confirmada.'
  const contact = `Si lo prefieres, puedes llamarnos al ${clinic.phone} o escribirnos a ${clinic.email}.`
  const html = layout(
    'Hemos recibido tu solicitud',
    `<p style="margin:0 0 12px">${escapeHtml(intro)}</p>
<p style="margin:0;padding:12px 16px;background:#eaf5fa;border-radius:10px;font-weight:bold;color:#163c63">${escapeHtml(notice)}</p>
${table(b)}
<p style="margin:0;color:#617386">Referencia: <strong>${escapeHtml(id)}</strong></p>
<p style="margin:12px 0 0;color:#617386">${escapeHtml(contact)}</p>
<p style="margin:16px 0 0;color:#617386;font-size:12px">Tratamos tus datos solo para gestionar esta solicitud. Más información en <a href="${escapeHtml(clinic.privacyUrl)}" style="color:#0b5e99">nuestra política de privacidad</a>.</p>`,
  )
  const text = `Hemos recibido tu solicitud\n\n${intro}\n\n${notice}\n\n${textTable(b)}\n\nReferencia: ${id}\n\n${contact}\n\nTratamos tus datos solo para gestionar esta solicitud. Política de privacidad: ${clinic.privacyUrl}`
  return { subject, html, text }
}
