/**
 * SEO por página (spec 10 §3): título, descripción, canonical, Open Graph / Twitter y schema.org.
 *
 * Schema.org como grafo enlazado por `@id`:
 *   MedicalClinic (global) ← WebSite (global) ← WebPage (por página) · BreadcrumbList · Service (por servicio)
 * Solo se marca lo que está visible y confirmado: sin AggregateRating/Review, FAQPage ni precios.
 *
 * Las URLs absolutas necesitan `NUXT_PUBLIC_SITE_URL`; el build de producción falla si falta (nuxt.config.ts).
 */
import { resolveValue as r } from '#shared/utils/pending'
import { siteHref } from '#shared/utils/seo'
import { site } from '~/data/site'
import { directionsUrl, openingHoursSchema } from '~/utils/clinic'

const BRAND = 'Valdepodo'
/** Imagen social por defecto (1200×630): foto real de la fachada de la clínica. */
const DEFAULT_OG = {
  src: '/images/og/valdepodo.jpg',
  alt: 'Fachada de la clínica de podología Valdepodo',
}

export type PageType = 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage'

export interface PageSeo {
  title: string
  description: string
  /** Ruta canónica (por defecto, la actual sin query, hash ni barra final). */
  path?: string
  /** `false`: el título ya incluye la marca y no se le añade « · Valdepodo». */
  brand?: boolean
  /** Página rastreable pero fuera del índice (textos legales, créditos). */
  noindex?: boolean
  /** Tipo schema.org de la página. */
  type?: PageType
  /** Imagen social propia (ruta en `public/`); por defecto, la de la clínica. */
  image?: { src: string; alt: string }
}

/** URL absoluta de una ruta del sitio (con `app.baseURL`), o `undefined` sin `NUXT_PUBLIC_SITE_URL`. */
export function absoluteUrl(path: string): string | undefined {
  const config = useRuntimeConfig()
  return siteHref(config.public.siteUrl, config.app.baseURL, path)
}

/** `@id` del nodo de la clínica en el grafo schema.org. */
export function clinicSchemaId(): string {
  const home = absoluteUrl('/')
  return home ? `${home}#clinica` : '#clinica'
}

const websiteSchemaId = () => {
  const home = absoluteUrl('/')
  return home ? `${home}#website` : '#website'
}

function jsonLd(key: string, data: unknown) {
  useHead({ script: [{ key, type: 'application/ld+json', innerHTML: JSON.stringify(data) }] })
}

export function usePageSeo(seo: PageSeo) {
  const route = useRoute()
  const path = seo.path ?? (route.path.length > 1 ? route.path.replace(/\/+$/, '') : route.path)
  const url = absoluteUrl(path)
  const image = seo.image ?? DEFAULT_OG
  const imageUrl = absoluteUrl(image.src)
  const socialTitle = seo.brand === false ? seo.title : `${seo.title} · ${BRAND}`

  if (seo.brand === false) useHead({ titleTemplate: '%s' })

  useSeoMeta({
    title: seo.title,
    description: seo.description,
    ogTitle: socialTitle,
    ogDescription: seo.description,
    ogUrl: url,
    ogImage: imageUrl,
    ogImageAlt: imageUrl ? image.alt : undefined,
    ogImageWidth: imageUrl ? 1200 : undefined,
    ogImageHeight: imageUrl ? 630 : undefined,
    twitterTitle: socialTitle,
    twitterDescription: seo.description,
    twitterImage: imageUrl,
    twitterImageAlt: imageUrl ? image.alt : undefined,
    ...(seo.noindex ? { robots: 'noindex, follow' } : {}),
  })

  if (url) {
    useHead({ link: [{ rel: 'canonical', href: url }] })
    jsonLd('schema-page', {
      '@context': 'https://schema.org',
      '@type': seo.type ?? 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: socialTitle,
      description: seo.description,
      inLanguage: 'es-ES',
      isPartOf: { '@id': websiteSchemaId() },
      about: { '@id': clinicSchemaId() },
    })
  }
}

/** Grafo global (en `app.vue`): `MedicalClinic` + `WebSite`. Mismo NAP que el footer y contacto. */
export function useClinicSchema() {
  const geo = r(site.geo)
  const instagram = r(site.instagram)
  const linkedin = r(site.linkedin)
  const city = r(site.city)
  const foundedYear = r(site.foundedYear)
  const home = absoluteUrl('/')
  const image = absoluteUrl(DEFAULT_OG.src)

  /*
   * Tipo: `MedicalClinic` (hereda de MedicalBusiness → LocalBusiness) es el que describe una clínica sanitaria
   * con sede física. `Physician` es para consultas de médicos; Schema.org no tiene un tipo propio de
   * podología, la especialidad se declara con `medicalSpecialty: Podiatric`.
   */
  jsonLd('schema-clinic', {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalClinic',
        '@id': clinicSchemaId(),
        name: BRAND,
        description: `Clínica de podología en ${city}: estudio biomecánico, plantillas personalizadas, podología general, infantil y pie diabético.`,
        url: home,
        image,
        medicalSpecialty: 'Podiatric',
        telephone: `+34${r(site.phone).replace(/\D/g, '')}`,
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
        hasMap: directionsUrl(geo),
        areaServed: { '@type': 'City', name: city },
        openingHoursSpecification: openingHoursSchema(r(site.hours)),
        foundingDate: typeof foundedYear === 'number' ? String(foundedYear) : undefined,
        sameAs: [instagram.url, linkedin.url],
      },
      {
        '@type': 'WebSite',
        '@id': websiteSchemaId(),
        url: home,
        name: BRAND,
        inLanguage: 'es-ES',
        publisher: { '@id': clinicSchemaId() },
      },
    ],
  })
}

export interface Crumb {
  name: string
  path: string
}

/** `BreadcrumbList`: debe coincidir con las migas visibles (`SiteBreadcrumbs`). */
export function useBreadcrumbSchema(crumbs: readonly Crumb[]) {
  jsonLd('schema-breadcrumbs', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path) ?? c.path,
    })),
  })
}

/**
 * `Service` por servicio, ofrecido por la clínica. (`MedicalProcedure` describe el acto clínico en sí, pensado
 * para contenido médico enciclopédico; para un servicio que presta un negocio local el tipo correcto es `Service`.)
 */
export function useServiceSchema(service: { name: string; description: string; path: string }) {
  jsonLd('schema-service', {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    serviceType: service.name,
    description: service.description,
    url: absoluteUrl(service.path),
    provider: { '@id': clinicSchemaId() },
    areaServed: { '@type': 'City', name: r(site.city) },
  })
}
