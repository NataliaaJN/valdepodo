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

/** Ficha de Google de Valdepodo (Valdemoro). Reseñas copiadas el 2026-11-14; nombre abreviado a nombre + inicial. */
const GOOGLE_URL = 'https://www.google.com/maps/place/?q=place_id:ChIJx99Z58YeQg0RoJD__ddoaX0'

/**
 * Resumen público de la ficha de Google, a fecha 2026-11-14. Se muestra como texto; NO se marca como
 * `AggregateRating` (spec 10 §3). Actualizar a mano junto con las reseñas.
 */
export const googleSummary = { rating: 4.7, count: 58, url: GOOGLE_URL } as const

export const reviews: readonly Review[] = [
  {
    text: 'El trato es muy bueno, son muy simpáticas y muy profesionales, tienen mucho cuidado con el trabajo que hacen, yo estoy muy contento y se lo recomiendo a todos que tengan algún problema con las uñas que acudan al esta clínica.',
    author: 'Alberto F.',
    rating: 5,
    source: 'Google',
    url: GOOGLE_URL,
  },
  {
    text: 'Fenomenal son cariñosas, amables, atentas, la verdad que la recomiendo 💯% a la hora de pedir citas son muy amables te cambian la cita sin ningún problema. Las chicas trabajan genial con mimo, llevo llevando a mi hijo desde hace 8 años y lo cambio mil gracias chicas…',
    author: 'Patricia C.',
    rating: 5,
    source: 'Google',
    url: GOOGLE_URL,
  },
  {
    text: 'Está ha sido la mejor podología en la que he estado, las demás podologías me ponían precios muy altos y me metían presión para operarme antes, que al final acabé haciendo en esta podologia. Muy buen comportamiento y tratamiento de las podólogas y si tienes miedo a lo que te puedan hacer puedo confirmar que no hacen casi daño y es muy económico. 5 estrellas.',
    author: 'Sergio T.',
    rating: 5,
    source: 'Google',
    url: GOOGLE_URL,
  },
]
