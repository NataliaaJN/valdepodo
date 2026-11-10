/**
 * Datos globales de la clínica (spec 09 §1). Única fuente para navbar, footer, contacto, pedir cita y
 * schema.org (mismo NAP en todas partes, spec 07 §5).
 *
 * Dirección, coordenadas, teléfono y horario vienen de la ficha pública de Google (research §3.1): son
 * reales, pero la ficha la puede editar cualquiera, así que siguen en `pending()` hasta que la clínica los
 * confirme. Lo desconocido (email, año de apertura) usa valores inequívocamente provisionales.
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
  /** Perfil público de Google (enlace "Ver en Google", SEO local). */
  googleProfileUrl: Maybe<string>
  foundedYear: Maybe<number>
  hours: Maybe<WeeklyHours>
  /** Plazo de respuesta a una solicitud de cita (pantalla de éxito y acuse). */
  responseTime: Maybe<string>
  nav: readonly NavItem[]
  footerNav: readonly NavItem[]
  legalNav: readonly NavItem[]
  cta: NavItem
}

const GOOGLE = 'Dato de la ficha pública de Google (research §3.1): confirmar con la clínica'

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
    street: pending('Calle Dr. Barraquer, 7', GOOGLE),
    postalCode: pending('28342', GOOGLE),
    locality: pending('Valdemoro', GOOGLE),
    region: pending('Madrid', GOOGLE),
  },
  geo: pending({ lat: 40.1922932, lng: -3.6762537 }, GOOGLE),
  phone: pending('687 50 69 27', GOOGLE),
  email: pending('correo-pendiente@valdepodo.invalid', 'Email público de la clínica'),
  instagram: pending(
    { handle: '@valdepodo', url: 'https://www.instagram.com/valdepodo/' },
    'Confirmar que la cuenta oficial es @valdepodo (research §3.2)',
  ),
  googleProfileUrl: pending(
    'https://www.google.com/maps/search/?api=1&query=VALDEPODO%20Cl%C3%ADnica%20de%20podolog%C3%ADa%20Valdemoro',
    'Enlace directo a la ficha de Google (el de "Compartir" de la ficha)',
  ),
  foundedYear: pending(2017, 'Año de apertura: la especificación habla de "9 años" (research §3.2)'),
  hours: pending([weekday, weekday, weekday, weekday, weekday, [], []], GOOGLE),
  responseTime: pending(
    'un plazo máximo de 48 horas laborables',
    'Plazo real de respuesta a las solicitudes',
  ),

  // Spec 02 §2: Servicios · La clínica · Equipo · Contacto · Pedir cita
  nav: [
    { label: 'Servicios', to: '/servicios' },
    { label: 'La clínica', to: '/conocenos' },
    { label: 'Equipo', to: '/conocenos#equipo' },
    { label: 'Contacto', to: '/contacto' },
  ],
  // Spec 02 §3
  footerNav: [
    { label: 'Inicio', to: '/' },
    { label: 'Servicios', to: '/servicios' },
    { label: 'Conócenos', to: '/conocenos' },
    { label: 'Pedir cita', to: '/pedir-cita' },
    { label: 'Contacto', to: '/contacto' },
  ],
  legalNav: [
    { label: 'Aviso legal', to: '/aviso-legal' },
    { label: 'Política de privacidad', to: '/privacidad' },
    { label: 'Política de cookies', to: '/cookies' },
    { label: 'Créditos', to: '/creditos' },
  ],
  cta: { label: 'Pedir cita', to: '/pedir-cita' },
}
