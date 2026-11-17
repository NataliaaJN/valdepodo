/**
 * `POST /api/cita` (spec 06 §3). Traduce la petición HTTP y delega en `handleBookingRequest`.
 * Configuración (runtimeConfig, solo servidor): `mailProvider`, `mailApiKey`, `mailFrom`,
 * `bookingToEmail`, `turnstileSecretKey`, `formHmacSecret`.
 * - Fuera de producción, sin proveedor de correo se usa el mailer `console` (no envía nada) y Turnstile es
 *   opcional. En producción todo es obligatorio: si falta algo, 503.
 */
import { resolveValue } from '#shared/utils/pending'
import { site } from '~/data/site'
import { createRateLimiter, createTurnstileVerifier } from '../utils/antispam'
import { handleBookingRequest } from '../utils/booking-handler'
import { createEmailBookingSink } from '../utils/booking-sink'
import { getFormSecret } from '../utils/form-secret'
import { createMailer } from '../utils/mailer'

const rateLimit = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 })

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const isProduction = config.public.siteEnv === 'production'

  const mailer = createMailer({
    provider: config.mailProvider || (isProduction ? '' : 'console'),
    apiKey: config.mailApiKey,
    from: config.mailFrom,
  })
  const clinicTo = config.bookingToEmail || (isProduction ? '' : 'clinica@example.invalid')
  const siteUrl = config.public.siteUrl
  const turnstileSecret = config.turnstileSecretKey
  // En producción, Turnstile es obligatorio: sin secreto, el formulario se considera no configurado
  const antispamReady = Boolean(turnstileSecret) || !isProduction

  const sink =
    mailer && clinicTo && antispamReady
      ? createEmailBookingSink({
          mailer,
          clinicTo,
          clinic: {
            name: site.name,
            phone: resolveValue(site.phone),
            email: resolveValue(site.email),
            privacyUrl: siteUrl ? new URL('/privacidad', siteUrl).toString() : '/privacidad',
            responseTime: resolveValue(site.responseTime),
          },
        })
      : null

  const result = await handleBookingRequest(
    {
      contentType: getRequestHeader(event, 'content-type'),
      origin: getRequestHeader(event, 'origin'),
      host: getRequestHeader(event, 'host'),
      ip: getRequestIP(event, { xForwardedFor: true }),
      rawBody: await readRawBody(event, 'utf8'),
    },
    {
      sink,
      formSecret: getFormSecret(config),
      turnstile: turnstileSecret ? createTurnstileVerifier(turnstileSecret) : null,
      rateLimit,
      allowedOrigins: siteUrl ? [siteUrl] : [],
      log: (entry) => console.info(JSON.stringify(entry)),
    },
  )

  setResponseStatus(event, result.status)
  return result.body
})
