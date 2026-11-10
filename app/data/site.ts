/**
 * Datos globales de la clínica (spec 09 §1). Todo lo no confirmado va en `pending()` con valores
 * visualmente inequívocos (nunca datos verosímiles que puedan pasar por reales).
 */
import { pending, type Maybe } from '#shared/utils/pending'

export interface NavItem {
  label: string
  to: string
}

export interface SiteData {
  name: string
  city: Maybe<string>
  phone: Maybe<string>
  instagram: Maybe<string>
  nav: readonly NavItem[]
  cta: NavItem
}

export const site: SiteData = {
  name: 'Valdepodo',
  city: pending('Valdemoro', 'Confirmar la ciudad que debe aparecer en los textos y el SEO'),
  phone: pending('+34 000 000 000', 'Teléfono real de la clínica'),
  instagram: pending('@valdepodo', 'Usuario real de Instagram'),
  // Spec 02 §2: Servicios · La clínica · Equipo · Contacto · Pedir cita
  nav: [
    { label: 'Servicios', to: '/servicios' },
    { label: 'La clínica', to: '/conocenos' },
    { label: 'Equipo', to: '/conocenos#equipo' },
    { label: 'Contacto', to: '/contacto' },
  ],
  cta: { label: 'Pedir cita', to: '/pedir-cita' },
}
