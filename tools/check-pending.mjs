#!/usr/bin/env node
/**
 * Comprobación de contenido provisional (spec 09 §3).
 *
 * - Importa todos los ficheros de datos, `app/data/` y el `data/` de cada feature (con jiti, para leer TypeScript y los alias `~` y `#shared`)
 *   y lista cada marcador `pending()` con su ruta y su nota.
 * - Busca además el literal `pending(` en `app/**\/*.vue` (textos provisionales definidos en las páginas).
 *
 * Uso:
 *   npm run check:pending            → informe (tabla) para enviar a la clínica; sale con 0
 *   npm run check:pending -- --strict → sale con 1 si queda alguno (build de producción)
 *   npm run check:pending -- --md     → informe en Markdown
 *
 * El build de producción (`NUXT_PUBLIC_SITE_ENV=production`) lo ejecuta en modo estricto (nuxt.config.ts).
 */
import { readdir, readFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createJiti } from 'jiti'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))

async function walk(dir, ext) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full, ext)))
    else if (entry.name.endsWith(ext)) out.push(full)
  }
  return out
}

/** Devuelve todos los marcadores pendientes del proyecto. */
export async function findPending(root = ROOT) {
  const jiti = createJiti(pathToFileURL(join(root, 'tools/check-pending.mjs')).href, {
    alias: { '~': join(root, 'app'), '#shared': join(root, 'shared') },
    interopDefault: true,
  })
  const { collectPending } = await jiti.import(join(root, 'shared/utils/pending.ts'))

  const entries = []
  // Datos globales (`app/data/`) y de cada feature (`app/features/*/data/`)
  const dataFiles = (await walk(join(root, 'app'), '.ts')).filter((f) =>
    /[\\/]app[\\/](data|features[\\/][^\\/]+[\\/]data)[\\/]/.test(f),
  )
  for (const file of dataFiles.sort()) {
    const mod = await jiti.import(file)
    const rel = relative(root, file).replaceAll('\\', '/')
    for (const [name, value] of Object.entries(mod)) {
      for (const item of collectPending(value, name))
        entries.push({ file: rel, path: item.path, note: item.note })
    }
  }

  for (const file of (await walk(join(root, 'app'), '.vue')).sort()) {
    const rel = relative(root, file).replaceAll('\\', '/')
    if (rel.startsWith('app/pages/_lab/')) continue
    const lines = (await readFile(file, 'utf8')).split(/\r?\n/)
    lines.forEach((line, i) => {
      const code = line.trim()
      // Comentarios y menciones entre comillas invertidas no cuentan
      if (/^(\*|\/\*|\/\/|<!--)/.test(code)) return
      if (/(?<![`\w.])pending\(/.test(code))
        entries.push({ file: `${rel}:${i + 1}`, path: '(componente)', note: code })
    })
  }
  return entries
}

async function main() {
  const args = new Set(process.argv.slice(2))
  const entries = await findPending()

  if (args.has('--md')) {
    console.log('| Fichero | Ruta | Nota |\n| --- | --- | --- |')
    for (const e of entries) console.log(`| ${e.file} | \`${e.path}\` | ${e.note.replaceAll('|', '\\|')} |`)
  } else if (entries.length) {
    console.table(entries)
  }

  const byFile = new Map()
  for (const e of entries) {
    const key = e.file.split(':')[0]
    byFile.set(key, (byFile.get(key) ?? 0) + 1)
  }
  console.log(`\n${entries.length} marcadores pendientes en ${byFile.size} ficheros.`)

  if (args.has('--strict') && entries.length) {
    console.error('✖ Queda contenido provisional (pending). El build de producción no puede continuar.')
    process.exit(1)
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
