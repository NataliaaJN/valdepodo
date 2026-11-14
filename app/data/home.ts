/**
 * Textos de la Home (spec 03). Titulares literales de la especificación (no son `pending`, spec 09 §5);
 * descripción y frases de la secuencia en `pending()` hasta que la clínica las valide.
 */
import { pending, type Maybe } from '#shared/utils/pending'
import type { FootLayer } from '~/utils/foot-layers'

export const hero = {
  title: { before: 'Todo empieza por ', accent: 'tus pies', after: '.' },
  description: pending(
    'Especialistas en podología, biomecánica y cuidado integral del pie.',
    'Propuesta de valor provisional (spec 03 §1): validar con la clínica',
  ) as Maybe<string>,
  primaryCta: { label: 'Pedir cita', to: '/contacto#cita' },
  secondaryCta: { label: 'Descubrir servicios', to: '#servicios' },
}

/**
 * Capas que ofrece el hero (spec 03 §1: Exterior · Músculos · Tendones · Huesos). Ligamentos no:
 * la fuente solo tiene uno (docs/fase2-viabilidad-pie.md §4). Solo se muestran las presentes en el GLB.
 */
export const heroLayers: readonly FootLayer[] = ['skin', 'muscles', 'tendons', 'bones']

const SEQUENCE_NOTE = 'Frase provisional de la secuencia del hero (spec 03 §1): validar con la clínica'

/**
 * Secuencia de scroll del hero (spec 03 §1, solo ≥ 1024 px y nivel `full`). Cada tramo fija la capa
 * activa y la orientación del modelo; el texto lateral cambia con él.
 */
export interface HeroStep {
  /** Inicio del tramo en el progreso 0..1 de la sección pineada. */
  at: number
  layer: FootLayer
  /** Rotación del modelo en Y (radianes). */
  rotationY: number
  text: Maybe<string> | null
}

export const heroSequence: readonly HeroStep[] = [
  { at: 0, layer: 'skin', rotationY: 0.8, text: null },
  {
    at: 0.25,
    layer: 'muscles',
    rotationY: 0,
    text: pending('Debajo de cada paso trabaja un sistema de músculos y tendones.', SEQUENCE_NOTE),
  },
  {
    at: 0.5,
    layer: 'bones',
    rotationY: -0.4,
    text: pending('Una estructura de huesos y articulaciones sostiene todo tu peso.', SEQUENCE_NOTE),
  },
  {
    at: 0.8,
    layer: 'bones',
    rotationY: -0.8,
    text: pending('Por eso lo primero es entender cómo es tu pie.', SEQUENCE_NOTE),
  },
]

/** Índice del tramo activo para un progreso dado. */
export function heroStepIndex(progress: number): number {
  let index = 0
  heroSequence.forEach((s, i) => {
    if (progress >= s.at) index = i
  })
  return index
}

/** Rotación continua: interpolación lineal entre los tramos (el modelo además la amortigua). */
export function heroRotationAt(progress: number): number {
  const steps = heroSequence
  if (progress <= steps[0]!.at) return steps[0]!.rotationY
  for (let i = 0; i < steps.length - 1; i++) {
    const a = steps[i]!
    const b = steps[i + 1]!
    if (progress <= b.at)
      return a.rotationY + ((progress - a.at) / (b.at - a.at)) * (b.rotationY - a.rotationY)
  }
  const last = steps.at(-1)!
  return last.rotationY
}

/** Tramo final (0.8–1): el modelo se aparta y se desvanece mientras entra Servicios. */
export const HERO_EXIT_START = 0.8

export const servicesSection = {
  id: 'servicios',
  title: { before: 'Cuidamos de tus pies en ', accent: 'cada paso', after: '.' },
}
