/**
 * Ruta de un archivo de `public/` respetando `app.baseURL`.
 * Con el sitio en una subruta (GitHub Pages: `/valdepodo/`) las rutas absolutas escritas a mano
 * (`/images/...`, `/models/...`) no pasan por Nuxt y apuntarían a la raíz del dominio.
 * URLs externas, `data:` y rutas relativas se devuelven tal cual.
 */
export function publicUrl(path: string): string
export function publicUrl(path: string | null | undefined): string | undefined
export function publicUrl(path: string | null | undefined): string | undefined {
  if (!path) return path === null ? undefined : path
  if (!path.startsWith('/') || path.startsWith('//')) return path
  const base = useRuntimeConfig().app.baseURL.replace(/\/$/, '')
  return base + path
}
