/**
 * Envío de correo transaccional (spec 06 §3). Interfaz `Mailer` + implementaciones por proveedor, todas
 * con `fetch` (sin SDK: el proveedor lo elige la clínica, research §2.2).
 * - `resend` · `brevo`: APIs HTTP.
 * - `console`: solo desarrollo; no envía nada y registra el envío **sin datos personales**.
 */
export interface MailMessage {
  to: string
  replyTo?: string
  subject: string
  html: string
  text: string
}

export interface Mailer {
  send(message: MailMessage): Promise<void>
}

export class MailerError extends Error {}

const TIMEOUT_MS = 10_000

function parseFrom(from: string): { name?: string; email: string } {
  const match = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/)
  return match ? { name: match[1] || undefined, email: match[2]! } : { email: from.trim() }
}

export function createResendMailer(apiKey: string, from: string, fetchImpl: typeof fetch = fetch): Mailer {
  return {
    async send(m) {
      const res = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to: [m.to],
          reply_to: m.replyTo,
          subject: m.subject,
          html: m.html,
          text: m.text,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      if (!res.ok) throw new MailerError(`Resend respondió ${res.status}`)
    },
  }
}

export function createBrevoMailer(apiKey: string, from: string, fetchImpl: typeof fetch = fetch): Mailer {
  const sender = parseFrom(from)
  return {
    async send(m) {
      const res = await fetchImpl('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          sender,
          to: [{ email: m.to }],
          replyTo: m.replyTo ? { email: m.replyTo } : undefined,
          subject: m.subject,
          htmlContent: m.html,
          textContent: m.text,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      if (!res.ok) throw new MailerError(`Brevo respondió ${res.status}`)
    },
  }
}

/** Solo desarrollo: no envía y no registra datos personales (solo tamaño del mensaje). */
export function createConsoleMailer(log: (msg: string) => void = console.info): Mailer {
  return {
    async send(m) {
      log(`[mailer:console] correo simulado (${m.text.length} caracteres de texto, sin enviar)`)
    },
  }
}

export interface MailerConfig {
  provider: string
  apiKey: string
  from: string
}

/** Elige la implementación según la configuración. `null` si falta configuración. */
export function createMailer(config: MailerConfig, fetchImpl: typeof fetch = fetch): Mailer | null {
  const provider = config.provider.toLowerCase()
  if (provider === 'console') return createConsoleMailer()
  if (!config.apiKey || !config.from) return null
  if (provider === 'resend') return createResendMailer(config.apiKey, config.from, fetchImpl)
  if (provider === 'brevo') return createBrevoMailer(config.apiKey, config.from, fetchImpl)
  return null
}
