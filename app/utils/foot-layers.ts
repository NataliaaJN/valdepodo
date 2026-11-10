/**
 * Capas del pie anatómico (spec 08 §2). Los ids coinciden con los grupos del GLB (tools/blender/extract_foot.py).
 * Solo se muestran en la interfaz las capas presentes en el modelo cargado.
 */
export type FootLayer = 'skin' | 'bones' | 'muscles' | 'tendons' | 'ligaments'

export const FOOT_LAYER_ORDER: FootLayer[] = ['skin', 'muscles', 'tendons', 'ligaments', 'bones']

export const FOOT_LAYER_LABELS: Record<FootLayer, string> = {
  skin: 'Exterior',
  muscles: 'Músculos',
  tendons: 'Tendones',
  ligaments: 'Ligamentos',
  bones: 'Huesos',
}

export type LayerRole = 'hidden' | 'active' | 'context' | 'shell'

/**
 * Qué papel tiene cada capa según la capa activa:
 * - active: protagonista (opaca, color de acento)
 * - context: referencia atenuada
 * - shell: el exterior como contorno translúcido (fresnel)
 */
export function layerRoles(active: FootLayer): Record<FootLayer, LayerRole> {
  if (active === 'skin') {
    return { skin: 'active', bones: 'hidden', muscles: 'hidden', tendons: 'hidden', ligaments: 'hidden' }
  }
  const roles: Record<FootLayer, LayerRole> = {
    skin: 'shell',
    bones: 'context',
    muscles: 'hidden',
    tendons: 'hidden',
    ligaments: 'hidden',
  }
  roles[active] = 'active'
  // Los músculos de la fuente incluyen sus tendones distales: el tendón calcáneo los acompaña.
  if (active === 'muscles') roles.tendons = 'active'
  if (active === 'tendons') roles.muscles = 'context'
  return roles
}
