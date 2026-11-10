/**
 * Antispam del formulario de cita (spec 06 §3.2):
 * - Honeypot `website` vacío.
 * - Tiempo mínimo desde que se cargó el formulario (≥ 3 s) con un token firmado con HMAC: no se puede
 *   falsificar sin el secreto. Las páginas se prerenderizan, así que el token lo emite el servidor en
 *   tiempo real (`GET /api/cita/token`), no el HTML.
 * - Turnstile (Cloudflare), si hay secreto configurado.
 * - Límite: 5 solicitudes / 10 min / IP, en memoria por instancia (research §7.2).
 */
import { createHmac, timingSafeEqual } from 'node:crypto'

export const MIN_FILL_MS = 3_000
export const MAX_TOKEN_AGE_MS = 2 * 60 * 60 * 1000

const sign = (payload: string, secret: string) =>
  createHmac('sha256', secret).update(payload).digest('base64url')

/** Token `<timestamp>.<firma>`. */
export function createFormToken(secret: string, now: number = Date.now()): string {
  const ts = String(now)
  return `${ts}.${sign(ts, secret)}`
}

export type FormTokenResult = 'ok' | 'invalid' | 'too_fast' | 'expired'

export function verifyFormToken(token: string, secret: string, now: number = Date.now()): FormTokenResult {
  const [ts, signature, ...rest] = token.split('.')
  if (!ts || !signature || rest.length || !/^\d{10,16}$/.test(ts)) return 'invalid'
  const expected = Buffer.from(sign(ts, secret))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return 'invalid'
  const age = now - Number(ts)
  if (age < MIN_FILL_MS) return 'too_fast'
  if (age > MAX_TOKEN_AGE_MS) return 'expired'
  return 'ok'
}

export const isHoneypotFilled = (value: string | undefined) => Boolean(value && value.trim())

/** Límite de solicitudes por clave (IP) en una ventana deslizante. */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>()
  return {
    /** Registra un intento y devuelve `false` si supera el límite. */
    hit(key: string, now: number = Date.now()): boolean {
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
      if (recent.length >= limit) {
        hits.set(key, recent)
        return false
      }
      recent.push(now)
      hits.set(key, recent)
      // Limpieza ocasional para no crecer sin fin
      if (hits.size > 5_000) {
        for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k)
      }
      return true
    },
  }
}

export type TurnstileVerifier = (token: string, ip: string | undefined) => Promise<boolean>

/** Verificación de Turnstile contra la API de Cloudflare. */
export function createTurnstileVerifier(secret: string, fetchImpl: typeof fetch = fetch): TurnstileVerifier {
  return async (token, ip) => {
    if (!token) return false
    const body = new URLSearchParams({ secret, response: token })
    if (ip) body.set('remoteip', ip)
    try {
      const res = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body,
        signal: AbortSignal.timeout(8_000),
      })
      const data = (await res.json()) as { success?: boolean }
      return data.success === true
    } catch {
      return false
    }
  }
}
