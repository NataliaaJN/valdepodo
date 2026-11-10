/**
 * Reseñas (spec 03 §4, research §9.4). **Solo reseñas reales con permiso y procedencia**: se copian a mano
 * desde la ficha de Google cuando la clínica lo autorice (sin Google Places API). Mientras la lista esté
 * vacía, la sección no se renderiza.
 * No se marcan como `AggregateRating` propio (spec 10 §3).
 */
export interface Review {
  text: string
  /** Nombre o iniciales, tal y como autorice la persona. */
  author: string
  /** Valoración sobre 5, si la reseña la tiene. */
  rating?: number
  source: 'Google'
  /** Enlace a la reseña o al perfil de la ficha. */
  url: string
}

export const reviews: readonly Review[] = []
