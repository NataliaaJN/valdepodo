/**
 * Fotografía de cada servicio. ÚNICO punto de sustitución de las imágenes: los componentes
 * (`ServiceTile`, cabeceras de servicio, relacionados) leen de aquí y aplican el mismo tratamiento
 * (monocromo azul en reposo, color al acercarse), así que las fotos definitivas se cambian editando solo `src`.
 *
 * ⚠️ PLACEHOLDERS. Las cinco URL de Unsplash son provisionales para desarrollar el diseño y las
 * interacciones; no son la dirección fotográfica definitiva. Para las definitivas: guardar los archivos en
 * `public/images/servicios/` y poner aquí `src: '/images/servicios/estudio-biomecanico.jpg'` (al ser local,
 * se sirve sin parámetros de tamaño: conviene exportarlas ya a ≤ 1600 px de ancho, WebP/AVIF).
 */
export interface ServiceMedia {
  /** URL o ruta de la imagen (horizontal, ≥ 1600 px de ancho). */
  src: string
  /** Punto focal (`object-position`) para los recortes de las tarjetas verticales. */
  focus?: string
  /** Texto alternativo. Vacío = decorativa (el nombre del servicio ya está en el enlace). */
  alt?: string
}

export const serviceMedia: Record<string, ServiceMedia> = {
  'estudio-biomecanico': {
    src: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1600&q=85',
    focus: '50% 55%',
  },
  'plantillas-personalizadas': {
    src: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1600&q=85',
    focus: '50% 60%',
  },
  'podologia-general': {
    src: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1600&q=85',
    focus: '50% 50%',
  },
  'podologia-infantil': {
    src: 'https://images.unsplash.com/photo-1540479859555-17af45c78602?auto=format&fit=crop&w=1600&q=85',
    focus: '50% 45%',
  },
  'pie-diabetico': {
    src: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=85',
    focus: '50% 50%',
  },
}

export function getServiceMedia(slug: string): ServiceMedia {
  const media = serviceMedia[slug]
  if (!media) throw new Error(`Sin imagen para el servicio: ${slug}`)
  return media
}

const UNSPLASH = 'https://images.unsplash.com/'

/** `srcset` solo para Unsplash (parámetro `w`). Las imágenes locales definitivas no lo necesitan. */
export function mediaSrcset(src: string, widths: readonly number[] = [640, 1000, 1600]): string | undefined {
  if (!src.startsWith(UNSPLASH)) return undefined
  const url = new URL(src)
  return widths
    .map((w) => {
      url.searchParams.set('w', String(w))
      return `${url.toString()} ${w}w`
    })
    .join(', ')
}
