import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { isPending } from '#shared/utils/pending'
import {
  HERO_EXIT_START,
  heroLayers,
  heroRotationAt,
  heroSequence,
  heroStepIndex,
} from '~/features/home/data/home'
import { servicePath, services } from '~/features/services/data/services'
import { site } from '~/data/site'
import { FOOT_LAYER_ORDER, FOOT_VIEW, layerRoles } from '~/features/home/utils/foot-layers'
import footView from '~~/tools/blender/config/foot-view.json'

const root = resolve(import.meta.dirname, '..', '..')
const pageFile = (path: string) => {
  const clean = path.split(/[?#]/)[0]!.replace(/^\//, '')
  const base = resolve(root, 'app/pages', clean || 'index')
  return existsSync(`${base}.vue`) || existsSync(resolve(base, 'index.vue'))
}

describe('secuencia del hero (spec 03 §1)', () => {
  it('tramos ordenados en 0..1 que empiezan en el exterior', () => {
    const ats = heroSequence.map((s) => s.at)
    expect(ats[0]).toBe(0)
    expect([...ats].sort((a, b) => a - b)).toEqual(ats)
    expect(ats.every((a) => a >= 0 && a < 1)).toBe(true)
    expect(heroSequence[0]!.layer).toBe('skin')
    expect(heroSequence.at(-1)!.at).toBe(HERO_EXIT_START)
  })

  it('el tramo activo cambia en los límites', () => {
    expect(heroStepIndex(0)).toBe(0)
    expect(heroStepIndex(0.249)).toBe(0)
    expect(heroStepIndex(0.25)).toBe(1)
    expect(heroStepIndex(0.6)).toBe(2)
    expect(heroStepIndex(1)).toBe(heroSequence.length - 1)
  })

  it('la rotación es continua y coincide con cada tramo en su inicio', () => {
    for (const s of heroSequence) expect(heroRotationAt(s.at)).toBeCloseTo(s.rotationY)
    for (let p = 0; p < 1; p += 0.01) {
      expect(Math.abs(heroRotationAt(p + 0.01) - heroRotationAt(p))).toBeLessThan(0.05)
    }
    expect(heroRotationAt(1)).toBe(heroSequence.at(-1)!.rotationY)
  })

  it('las frases de la secuencia están pendientes de validar (spec 09 §4)', () => {
    for (const s of heroSequence) if (s.text) expect(isPending(s.text)).toBe(true)
  })

  it('capas del hero: las de la spec, sin ligamentos (fase2-viabilidad-pie §4)', () => {
    expect(heroLayers).toEqual(['skin', 'muscles', 'tendons', 'bones'])
    for (const l of heroLayers) expect(FOOT_LAYER_ORDER).toContain(l)
  })

  it('nunca más de una capa opaca protagonista además de sus tendones (spec 03 §1)', () => {
    for (const layer of heroLayers) {
      const roles = layerRoles(layer)
      expect(roles[layer]).toBe('active')
      if (layer !== 'skin') expect(roles.skin).toBe('shell')
    }
  })
})

describe('encuadre compartido web ↔ pósters', () => {
  it('la escena web lee foot-view.json', () => {
    expect(FOOT_VIEW.position).toEqual(footView.position)
    expect(FOOT_VIEW.rotationY).toBe(heroSequence[0]!.rotationY)
  })

  it('un póster por capa del hero (spec 08 §5)', () => {
    expect(footView.posters.map((p) => p.layer).sort()).toEqual([...heroLayers].sort())
    for (const p of footView.posters) {
      expect(existsSync(resolve(root, `public/images/3d-fallbacks/foot/${p.name}.avif`))).toBe(true)
      expect(existsSync(resolve(root, `public/images/3d-fallbacks/foot/${p.name}-800.webp`))).toBe(true)
    }
  })
})

describe('servicios y navegación', () => {
  it('5 servicios, 3 destacados en la Home (spec 03 §2)', () => {
    expect(services).toHaveLength(5)
    expect(services.filter((s) => s.featured).map((s) => s.slug)).toEqual([
      'estudio-biomecanico',
      'plantillas-personalizadas',
      'podologia-general',
    ])
    for (const s of services) expect(isPending(s.summary)).toBe(true)
  })

  it('todos los enlaces de la navbar y de los servicios tienen página (sin 404 en la propuesta)', () => {
    const paths = [...site.nav.map((n) => n.to), site.cta.to, ...services.map((s) => servicePath(s.slug))]
    for (const p of paths) expect(pageFile(p), p).toBe(true)
  })
})
