/**
 * Secreto HMAC del token del formulario. En producción es obligatorio (`NUXT_FORM_HMAC_SECRET`); fuera de
 * producción se usa uno fijo de desarrollo para poder probar el wizard sin configurar nada.
 */
export function getFormSecret(config: { formHmacSecret: string; public: { siteEnv: string } }): string {
  if (config.formHmacSecret) return config.formHmacSecret
  return config.public.siteEnv === 'production' ? '' : 'valdepodo-dev-only-secret'
}
