#!/usr/bin/env node
/**
 * Pósters de fallback de las escenas 3D (docs/3d-pipeline.md §8, spec 08 §5).
 *
 *   node tools/assets/posters.mjs <nombre>
 *
 * Convierte los PNG renderizados por Blender (tools/out/posters/<nombre>/*.png, fondo transparente) a
 * public/images/3d-fallbacks/<nombre>/<póster>.{avif,webp} (1600 px) y <póster>-800.{avif,webp}.
 */
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, basename } from 'node:path'
import sharp from 'sharp'

const root = resolve(import.meta.dirname, '..', '..')
const name = process.argv[2]
if (!name) {
  console.error('Uso: posters.mjs <nombre>  (p. ej. insole)')
  process.exit(1)
}

const inputDir = join(root, 'tools/out/posters', name)
if (!existsSync(inputDir)) {
  console.error(`✖ No existe ${inputDir}. Renderiza primero los pósters con Blender (--posters).`)
  process.exit(1)
}
const outDir = join(root, 'public/images/3d-fallbacks', name)
mkdirSync(outDir, { recursive: true })

const WIDTHS = [
  { width: 1600, suffix: '' },
  { width: 800, suffix: '-800' },
]

for (const file of readdirSync(inputDir).filter((f) => f.endsWith('.png'))) {
  const stem = basename(file, '.png')
  for (const { width, suffix } of WIDTHS) {
    const base = sharp(join(inputDir, file)).resize({ width, withoutEnlargement: true })
    const avif = join(outDir, `${stem}${suffix}.avif`)
    const webp = join(outDir, `${stem}${suffix}.webp`)
    await base.clone().avif({ quality: 55, effort: 6 }).toFile(avif)
    await base.clone().webp({ quality: 80, alphaQuality: 90 }).toFile(webp)
    const kb = (p) => (statSync(p).size / 1024).toFixed(1)
    console.log(`✔ ${name}/${stem}${suffix}  avif ${kb(avif)} KB · webp ${kb(webp)} KB`)
  }
}
