/**
 * Material "satinado azul hielo" del pie (spec 08 §2.2) sobre MeshPhysicalMaterial, con dos añadidos:
 * - fundido del corte de la pierna (`uFadeTop`) → la pierna se disuelve en el fondo;
 * - resalte de las zonas de apoyo plantar (`uHighlight` 0–1), ilustrativo, para la secuencia de scroll.
 */
import { CanvasTexture, Color, MeshPhysicalMaterial, SRGBColorSpace } from 'three'

export function createFootMaterial(fadeTop: number) {
  const uniforms = {
    uFadeTop: { value: fadeTop },
    uHighlight: { value: 0 },
    uHighlightColor: { value: new Color('#1EABE1') },
    uRim: { value: 0.6 },
  }
  const material = new MeshPhysicalMaterial({
    color: '#DCEAF3',
    roughness: 0.42,
    sheen: 0.6,
    sheenColor: '#B9E5F3',
    sheenRoughness: 0.45,
    clearcoat: 0.2,
    clearcoatRoughness: 0.55,
    vertexColors: true, // oclusión ambiental horneada
    transparent: true,
  })
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vFootPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFootPos = position;')
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vFootPos;\nuniform float uFadeTop, uHighlight, uRim;\nuniform vec3 uHighlightColor;',
      )
      .replace(
        '#include <color_fragment>',
        '#include <color_fragment>\ndiffuseColor.a *= 1.0 - smoothstep(uFadeTop - 0.4, uFadeTop - 0.02, vFootPos.y);',
      )
      .replace(
        '#include <emissivemap_fragment>',
        /* glsl */ `#include <emissivemap_fragment>
        {
          float sole = 1.0 - smoothstep(0.02, 0.1, vFootPos.y);
          vec2 p = vFootPos.xz;
          float heel = exp(-dot((p - vec2(0.38, 0.04)) / vec2(0.2, 0.15), (p - vec2(0.38, 0.04)) / vec2(0.2, 0.15)));
          float ball = exp(-dot((p - vec2(1.86, -0.05)) / vec2(0.15, 0.34), (p - vec2(1.86, -0.05)) / vec2(0.15, 0.34)));
          float hallux = exp(-dot((p - vec2(2.42, -0.36)) / vec2(0.09, 0.08), (p - vec2(2.42, -0.36)) / vec2(0.09, 0.08)));
          float band = exp(-dot((p - vec2(1.2, 0.2)) / vec2(0.4, 0.1), (p - vec2(1.2, 0.2)) / vec2(0.4, 0.1)));
          totalEmissiveRadiance += uHighlightColor * sole * (heel + ball + 0.8 * hallux + 0.35 * band) * uHighlight * 2.0;
          // borde cian suave: acento de iluminación, no de forma
          float rim = pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), 3.0);
          totalEmissiveRadiance += uHighlightColor * rim * uRim;
        }`,
      )
  }
  return { material, uniforms }
}

/** Sombra de contacto falsa (spec 08 §1.3): degradado radial azul profundo. */
export function createContactShadowTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(22, 60, 99, 0.42)')
  g.addColorStop(0.55, 'rgba(22, 60, 99, 0.14)')
  g.addColorStop(1, 'rgba(22, 60, 99, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}
