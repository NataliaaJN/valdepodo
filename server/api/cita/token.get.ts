/**
 * Token firmado con la hora de carga del formulario (spec 06 §3.2). Lo pide el wizard al montarse: las
 * páginas se prerenderizan y la hora tiene que venir del servidor en el momento de la visita.
 */
import { createFormToken } from '../../utils/antispam'
import { getFormSecret } from '../../utils/form-secret'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const secret = getFormSecret(useRuntimeConfig(event))
  if (!secret) throw createError({ statusCode: 503, statusMessage: 'Formulario no configurado' })
  return { token: createFormToken(secret) }
})
