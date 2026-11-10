#!/usr/bin/env node
/**
 * Optimización de GLB con gltf-transform (docs/3d-pipeline.md §7).
 *
 *   node tools/assets/optimize.mjs <nombre>
 *
 * Lee tools/out/<nombre>.raw.glb y escribe public/models/<nombre>.glb (y variantes según el manifiesto),
 * aplicando dedupe → prune → weld → (simplify) → quantize → meshopt.
 * Actualiza tools/assets/manifest.json con bytes y triángulos de cada salida.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, prune, weld, simplify, quantize, meshopt } from '@gltf-transform/functions'
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer'

const root = resolve(import.meta.dirname, '..', '..')
const manifestPath = join(root, 'tools/assets/manifest.json')

const name = process.argv[2]
if (!name) {
  console.error('Uso: optimize.mjs <nombre>  (p. ej. test-cube)')
  process.exit(1)
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const entry = manifest.models.find((m) => m.name === name)
if (!entry) {
  console.error(
    `✖ "${name}" no está en tools/assets/manifest.json. Añade su entrada (fuente y licencia) primero.`,
  )
  process.exit(1)
}

const input = join(root, 'tools/out', `${name}.raw.glb`)
if (!existsSync(input)) {
  console.error(`✖ No existe ${input}. Genera primero el modelo con Blender.`)
  process.exit(1)
}

await MeshoptEncoder.ready
await MeshoptSimplifier.ready

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder,
})

function countTriangles(document) {
  let total = 0
  for (const mesh of document.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const indices = prim.getIndices()
      const position = prim.getAttribute('POSITION')
      total += Math.floor((indices ? indices.getCount() : (position?.getCount() ?? 0)) / 3)
    }
  }
  return total
}

mkdirSync(join(root, 'public/models'), { recursive: true })
const outputs = []

for (const variant of entry.variants) {
  const document = await io.read(input)
  const transforms = [dedup(), prune(), weld()]
  if (variant.simplifyRatio && variant.simplifyRatio < 1) {
    transforms.push(
      simplify({
        simplifier: MeshoptSimplifier,
        ratio: variant.simplifyRatio,
        error: variant.simplifyError ?? 0.001,
      }),
    )
  }
  transforms.push(quantize(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }))
  await document.transform(...transforms)

  const file = `public/models/${variant.file}` // ruta POSIX: el manifiesto se versiona
  await io.write(join(root, file), document)
  const bytes = statSync(join(root, file)).size
  const triangles = countTriangles(document)
  outputs.push({ file, bytes, triangles })
  console.log(`✔ ${file}  ${(bytes / 1024).toFixed(1)} KB  ${triangles} triángulos`)
}

entry.outputs = outputs
entry.optimizedAt = new Date().toISOString().slice(0, 19) + 'Z'
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
