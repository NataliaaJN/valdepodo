#!/usr/bin/env node
/**
 * Lanzador de Blender en modo headless para el pipeline 3D (docs/3d-pipeline.md §5).
 *
 *   node tools/blender/run-blender.mjs --check
 *   node tools/blender/run-blender.mjs <script.py> -- [argumentos del script]
 *
 * Ruta de Blender: variable BLENDER_BIN (entorno o .env) o, en su defecto, la instalación portable
 * por usuario en %LOCALAPPDATA%/Programs/blender-5.2.*-windows-x64/blender.exe.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const REQUIRED_MAJOR_MINOR = '5.2'
const root = resolve(import.meta.dirname, '..', '..')

function readDotEnv(key) {
  const file = join(root, '.env')
  if (!existsSync(file)) return undefined
  const line = readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .find((l) => l.trim().startsWith(`${key}=`))
  const value = line?.slice(line.indexOf('=') + 1).trim()
  return value ? value.replace(/^["']|["']$/g, '') : undefined
}

function findBlender() {
  const fromEnv = process.env.BLENDER_BIN || readDotEnv('BLENDER_BIN')
  if (fromEnv) return fromEnv
  const programs = process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Programs')
  if (programs && existsSync(programs)) {
    const dir = readdirSync(programs)
      .filter((d) => d.startsWith(`blender-${REQUIRED_MAJOR_MINOR}.`))
      .sort()
      .at(-1)
    if (dir) {
      const exe = join(programs, dir, 'blender.exe')
      if (existsSync(exe)) return exe
    }
  }
  return undefined
}

const blender = findBlender()
if (!blender || !existsSync(blender)) {
  console.error(
    `✖ No se encuentra Blender ${REQUIRED_MAJOR_MINOR}. Define BLENDER_BIN en .env (ver docs/3d-pipeline.md §4).`,
  )
  process.exit(1)
}

const args = process.argv.slice(2)

if (args[0] === '--check') {
  const version = spawnSync(blender, ['--version'], { encoding: 'utf8' })
  const first = (version.stdout || '').split(/\r?\n/)[0] ?? ''
  console.log(`Blender: ${blender}`)
  console.log(first)
  if (!first.includes(`Blender ${REQUIRED_MAJOR_MINOR}.`)) {
    console.error(`✖ Se requiere Blender ${REQUIRED_MAJOR_MINOR}.x LTS`)
    process.exit(1)
  }
  const probe = spawnSync(
    blender,
    [
      '-b',
      '--factory-startup',
      '--python-expr',
      "import bpy, sys; ok = hasattr(bpy.ops.export_scene, 'gltf'); print('GLTF_EXPORTER', ok); sys.exit(0 if ok else 1)",
    ],
    { encoding: 'utf8' },
  )
  const ok = probe.status === 0 && probe.stdout.includes('GLTF_EXPORTER True')
  console.log(ok ? '✔ Exportador glTF disponible' : '✖ Exportador glTF no disponible')
  process.exit(ok ? 0 : 1)
}

const [script, ...rest] = args
if (!script) {
  console.error('Uso: run-blender.mjs <script.py> -- [args] | --check')
  process.exit(1)
}

const scriptArgs = rest[0] === '--' ? rest.slice(1) : rest
const result = spawnSync(
  blender,
  // --disable-autoexec: los .blend de terceros nunca ejecutan sus scripts embebidos.
  [
    '-b',
    '--factory-startup',
    '--disable-autoexec',
    '--python-exit-code',
    '1',
    '-P',
    resolve(root, script),
    '--',
    ...scriptArgs,
  ],
  { stdio: 'inherit', cwd: root },
)
process.exit(result.status ?? 1)
