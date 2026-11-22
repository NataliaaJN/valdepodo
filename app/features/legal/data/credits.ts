/**
 * Créditos y licencias de recursos de terceros (spec 10 §7, plan Fase 6.7). Los modelos 3D tienen además su
 * ficha técnica en `public/models/CREDITS.md` (lo comprueba `npm run 3d:check`).
 */
export interface Credit {
  name: string
  use: string
  author: string
  license: string
  url: string
}

export const assetCredits: readonly Credit[] = [
  {
    name: 'BodyParts3D 4.0',
    use: 'Base del modelo anatómico del pie (exterior, músculos, tendones y huesos), modificada: selección de estructuras, recorte, simplificación y compresión.',
    author: '© The Database Center for Life Science',
    license: 'CC BY 4.0',
    url: 'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/',
  },
]

export const fontCredits: readonly Credit[] = [
  {
    name: 'Bricolage Grotesque',
    use: 'Titulares y claim',
    author: 'Mathieu Triay',
    license: 'SIL Open Font License 1.1',
    url: 'https://fonts.google.com/specimen/Bricolage+Grotesque',
  },
  {
    name: 'Instrument Sans',
    use: 'Texto',
    author: 'Rodrigo Fuenzalida, Jordan Egstad',
    license: 'SIL Open Font License 1.1',
    url: 'https://fonts.google.com/specimen/Instrument+Sans',
  },
]

export const softwareCredits: readonly Credit[] = [
  {
    name: 'Nuxt y Vue',
    use: 'Aplicación web',
    author: 'Equipos de Nuxt y Vue',
    license: 'MIT',
    url: 'https://nuxt.com',
  },
  {
    name: 'three.js',
    use: 'Escenas 3D',
    author: 'three.js authors',
    license: 'MIT',
    url: 'https://threejs.org',
  },
  { name: 'TresJS', use: 'Escenas 3D en Vue', author: 'TresJS', license: 'MIT', url: 'https://tresjs.org' },
  {
    name: 'GSAP',
    use: 'Animaciones',
    author: 'GreenSock (Webflow)',
    license: 'GSAP Standard License',
    url: 'https://gsap.com',
  },
  {
    name: 'Tailwind CSS',
    use: 'Estilos',
    author: 'Tailwind Labs',
    license: 'MIT',
    url: 'https://tailwindcss.com',
  },
  {
    name: 'Zod',
    use: 'Validación del formulario',
    author: 'Colin McDonnell',
    license: 'MIT',
    url: 'https://zod.dev',
  },
  {
    name: 'Blender',
    use: 'Preparación de modelos y pósters (fuera de la web)',
    author: 'Blender Foundation',
    license: 'GPL (los modelos generados no la heredan)',
    url: 'https://www.blender.org',
  },
]
