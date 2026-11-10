/**
 * Valores derivados de `site.ts` ya resueltos (enlaces `tel:`/`mailto:`, dirección en una línea, años de
 * experiencia…). Para marcar en pantalla lo pendiente, los componentes siguen usando `<ContentValue>` con
 * el dato original de `site`.
 */
import { resolveValue as r } from '#shared/utils/pending'
import { site } from '~/data/site'
import { directionsUrl, telHref, yearsSince } from '~/utils/clinic'

export function useClinic() {
  const phone = r(site.phone)
  const email = r(site.email)
  const geo = r(site.geo)
  const address = {
    street: r(site.address.street),
    postalCode: r(site.address.postalCode),
    locality: r(site.address.locality),
    region: r(site.address.region),
  }
  return {
    phone,
    phoneHref: telHref(phone),
    email,
    mailHref: `mailto:${email}`,
    instagram: r(site.instagram),
    geo,
    directions: directionsUrl(geo),
    address,
    addressLine: `${address.street}, ${address.postalCode} ${address.locality}, ${address.region}`,
    hours: r(site.hours),
    years: yearsSince(r(site.foundedYear)),
  }
}
