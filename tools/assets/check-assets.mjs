#!/usr/bin/env node
/**
 * Comprobaciones de los modelos publicados (docs/3d-pipeline.md §10-11):
 *  1. Todo GLB de public/models tiene entrada en el manifiesto.
 *  2. Cada entrada del manifiesto tiene sección en public/models/CREDITS.md.
 *  3. Cada salida cumple su presupuesto de peso y triángulos.
 *  4. Con --production: todo modelo usado debe tener `validatedBy` (salvo los marcados como laboratorio).
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..', '..')
const production = process.argv.includes('--production')
const manifest = JSON.parse(readFileSync(join(root, 'tools/assets/manifest.json'), 'utf8'))
const creditsPath = join(root, 'public/models/CREDITS.md')
const credits = existsSync(creditsPath) ? readFileSync(creditsPath, 'utf8') : ''
const errors = []

const published = existsSync(join(root, 'public/models'))
  ? readdirSync(join(root, 'public/models')).filter((f) => f.endsWith('.glb'))
  : []
const declared = new Map(manifest.models.flatMap((m) => m.variants.map((v) => [v.file, m])))

for (const file of published) {
  if (!declared.has(file)) errors.push(`${file}: no tiene entrada en tools/assets/manifest.json`)
}

for (const model of manifest.models) {
  if (!credits.includes(`<!-- credits:${model.credits} -->`)) {
    errors.push(
      `${model.name}: falta su sección en public/models/CREDITS.md (<!-- credits:${model.credits} -->)`,
    )
  }
  for (const out of model.outputs ?? []) {
    const path = join(root, out.file)
    if (!existsSync(path)) continue
    const bytes = statSync(path).size
    if (model.budget?.maxBytes && bytes > model.budget.maxBytes) {
      errors.push(`${out.file}: ${bytes} bytes > presupuesto ${model.budget.maxBytes}`)
    }
    if (model.budget?.maxTriangles && out.triangles > model.budget.maxTriangles) {
      errors.push(`${out.file}: ${out.triangles} triángulos > presupuesto ${model.budget.maxTriangles}`)
    }
  }
  const labOnly = model.purpose?.includes('/_lab')
  if (production && !labOnly && !model.validatedBy) {
    errors.push(`${model.name}: sin validar (validatedBy vacío)`)
  }
}

if (errors.length) {
  console.error('✖ Comprobación de modelos 3D:\n  - ' + errors.join('\n  - '))
  process.exit(1)
}
console.log(`✔ Modelos 3D: ${published.length} GLB publicados, manifiesto y créditos coherentes.`)
