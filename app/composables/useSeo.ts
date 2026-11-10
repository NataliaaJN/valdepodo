/**
 * SEO por página (spec 10 §3): título, descripción, canonical y Open Graph, más los schema.org comunes
 * (clínica, breadcrumbs, servicio). La imagen OG por página (1200×630) llega en la Fase 7.
 */
import { resolveValue as r } from '#shared/utils/pending'
import { site } from '~/data/site'
import { openingHoursSchema } from '~/utils/clinic'

export interface PageSeo {
  title: string
  description: string
  /** Ruta canónica (por defecto, la actual sin query ni hash). */
  path?: string
}

function absoluteUrl(path: string): string | undefined {
  const base = useRuntimeConfig().public.siteUrl
  return base ? new URL(path, base).toString() : undefined
}

export function usePageSeo(seo: PageSeo) {
  const route = useRoute()
  const url = absoluteUrl(seo.path ?? route.path)
  useSeoMeta({
    title: seo.title,
    description: seo.description,
    ogTitle: `${seo.title} · Valdepodo`,
    ogDescription: seo.description,
    ogUrl: url,
  })
  if (url) useHead({ link: [{ rel: 'canonical', href: url }] })
}

const CLINIC_ID = '#clinica'

/** `MedicalClinic` global (spec 03 SEO, spec 07 §5). Mismo NAP que el footer y contacto. */
export function useClinicSchema() {
  const geo = r(site.geo)
  const instagram = r(site.instagram)
  const siteUrl = useRuntimeConfig().public.siteUrl || undefined
  useHead({
    script: [
      {
        key: 'schema-clinic',
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': ['MedicalClinic', 'MedicalBusiness'],
          '@id': siteUrl ? `${siteUrl}/${CLINIC_ID}` : CLINIC_ID,
          name: 'Valdepodo · Clínica de podología',
          url: siteUrl,
          medicalSpecialty: 'Podiatric',
          telephone: `+34 ${r(site.phone)}`,
          email: r(site.email),
          address: {
            '@type': 'PostalAddress',
            streetAddress: r(site.address.street),
            postalCode: r(site.address.postalCode),
            addressLocality: r(site.address.locality),
            addressRegion: r(site.address.region),
            addressCountry: 'ES',
          },
          geo: { '@type': 'GeoCoordinates', latitude: geo.lat, longitude: geo.lng },
          hasMap: r(site.googleProfileUrl),
          openingHoursSpecification: openingHoursSchema(r(site.hours)),
          sameAs: [instagram.url],
        }),
      },
    ],
  })
}

export interface Crumb {
  name: string
  path: string
}

/** `BreadcrumbList` (spec 04, spec 10 §3). */
export function useBreadcrumbSchema(crumbs: readonly Crumb[]) {
  useHead({
    script: [
      {
        key: 'schema-breadcrumbs',
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: crumbs.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.name,
            item: absoluteUrl(c.path) ?? c.path,
          })),
        }),
      },
    ],
  })
}

/** `MedicalProcedure` por servicio, vinculado a la clínica (spec 04). */
export function useServiceSchema(service: { name: string; description: string; path: string }) {
  const siteUrl = useRuntimeConfig().public.siteUrl
  useHead({
    script: [
      {
        key: 'schema-service',
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'MedicalProcedure',
          name: service.name,
          description: service.description,
          url: absoluteUrl(service.path),
          provider: { '@id': siteUrl ? `${siteUrl}/${CLINIC_ID}` : CLINIC_ID },
        }),
      },
    ],
  })
}
