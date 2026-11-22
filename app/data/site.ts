/**
 * Datos globales de la clínica (spec 09 §1). Única fuente para navbar, footer, contacto, pedir cita y
 * schema.org (mismo NAP en todas partes, spec 07 §5).
 *
 * Dirección, coordenadas, teléfono (también WhatsApp), horario, email, Instagram y LinkedIn están
 * confirmados por la clínica. Lo desconocido (razón social, año de apertura) sigue en `pending()`.
 */
import { pending, type Maybe } from '#shared/utils/pending'

export interface NavItem {
  label: string
  to: string
}

/** Franja de apertura en hora local de Madrid ("HH:MM"). */
export interface OpeningSlot {
  open: string
  close: string
}

/** Horario por día: índice 0 = lunes … 6 = domingo. Lista vacía = cerrado. */
export type WeeklyHours = readonly (readonly OpeningSlot[])[]

export interface SiteData {
  name: string
  legalName: Maybe<string>
  tagline: Maybe<string>
  city: Maybe<string>
  address: {
    street: Maybe<string>
    postalCode: Maybe<string>
    locality: Maybe<string>
    region: Maybe<string>
  }
  geo: Maybe<{ lat: number; lng: number }>
  /** Teléfono tal y como se muestra (formato nacional). */
  phone: Maybe<string>
  email: Maybe<string>
  instagram: Maybe<{ handle: string; url: string }>
  linkedin: Maybe<{ label: string; url: string }>
  foundedYear: Maybe<number>
  hours: Maybe<WeeklyHours>
  /** Plazo de respuesta a una solicitud de cita (pantalla de éxito y acuse). */
  responseTime: Maybe<string>
  nav: readonly NavItem[]
  footerNav: readonly NavItem[]
  legalNav: readonly NavItem[]
  cta: NavItem
}

const weekday: OpeningSlot[] = [
  { open: '10:00', close: '13:30' },
  { open: '16:30', close: '20:00' },
]

export const site: SiteData = {
  name: 'Valdepodo',
  legalName: pending('[Razón social pendiente]', 'Titular de la web (aviso legal y privacidad)'),
  tagline: pending('Salud desde la base.', 'Frase de marca del footer (spec 02 §3): validar con la clínica'),
  city: pending('Valdemoro', 'Confirmar la ciudad que debe aparecer en los textos y el SEO'),
  address: {
    street: 'Calle Dr. Barraquer, 7',
    postalCode: '28342',
    locality: 'Valdemoro',
    region: 'Madrid',
  },
  geo: { lat: 40.1922932, lng: -3.6762537 },
  phone: '687 50 69 27',
  email: 'valdepodo26@gmail.com',
  instagram: { handle: '@valdepodo', url: 'https://www.instagram.com/valdepodo/' },
  linkedin: { label: 'Valdepodo', url: 'https://es.linkedin.com/company/valdepodo' },
  foundedYear: 2017,
  hours: [weekday, weekday, weekday, weekday, weekday, [], []],
  responseTime: pending(
    'un plazo máximo de 48 horas laborables',
    'Plazo real de respuesta a las solicitudes',
  ),

  // Navbar: Inicio · Servicios · Sobre nosotros (clínica y equipo) · Contacto · Pedir cita
  nav: [
    { label: 'Inicio', to: '/' },
    { label: 'Servicios', to: '/servicios' },
    { label: 'Sobre nosotros', to: '/conocenos' },
    { label: 'Contacto', to: '/contacto' },
  ],
  // Spec 02 §3
  footerNav: [
    { label: 'Inicio', to: '/' },
    { label: 'Servicios', to: '/servicios' },
    { label: 'La clínica', to: '/conocenos' },
    { label: 'Pedir cita', to: '/contacto#cita' },
    { label: 'Contacto', to: '/contacto' },
  ],
  legalNav: [
    { label: 'Aviso legal', to: '/aviso-legal' },
    { label: 'Política de privacidad', to: '/privacidad' },
    { label: 'Política de cookies', to: '/cookies' },
    { label: 'Créditos', to: '/creditos' },
  ],
  cta: { label: 'Pedir cita', to: '/contacto#cita' },
}
