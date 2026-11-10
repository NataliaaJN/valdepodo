/**
 * Nivel de capacidad del dispositivo para las experiencias 3D (spec 08 §1.1).
 * Función pura para poder probarla sin navegador.
 */
export type DeviceTier = 'full' | 'lite' | 'static'

export interface DeviceSignals {
  webgl2: boolean
  saveData: boolean
  reducedMotion: boolean
  contextLostBefore: boolean
  viewportWidth: number
  /** GB de memoria (navigator.deviceMemory); undefined si el navegador no lo expone. */
  deviceMemory?: number
  /** Núcleos lógicos (navigator.hardwareConcurrency); undefined si no se expone. */
  hardwareConcurrency?: number
}

export const LITE_MAX_WIDTH = 1023

export function computeDeviceTier(s: DeviceSignals): DeviceTier {
  if (!s.webgl2 || s.saveData || s.contextLostBefore || s.reducedMotion) return 'static'
  if (s.viewportWidth <= LITE_MAX_WIDTH) return 'lite'
  if (s.deviceMemory !== undefined && s.deviceMemory <= 4) return 'lite'
  if (s.hardwareConcurrency !== undefined && s.hardwareConcurrency <= 4) return 'lite'
  return 'full'
}
