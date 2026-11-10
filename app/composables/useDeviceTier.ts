import { computeDeviceTier, type DeviceTier } from '~/utils/device-tier'

const CONTEXT_LOST_KEY = 'vp-webgl-lost'

interface NavigatorWithHints extends Navigator {
  deviceMemory?: number
  connection?: { saveData?: boolean }
}

function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    const ok = gl !== null
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return ok
  } catch {
    return false
  }
}

function readSessionFlag(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

/**
 * Devuelve el nivel del dispositivo, compartido en toda la app.
 * En SSR (y hasta montar en cliente) vale 'static': se renderiza el póster.
 */
export function useDeviceTier() {
  const tier = useState<DeviceTier>('device-tier', () => 'static')
  const resolved = useState<boolean>('device-tier-resolved', () => false)

  function resolve() {
    if (!import.meta.client || resolved.value) return
    const nav = navigator as NavigatorWithHints
    tier.value = computeDeviceTier({
      webgl2: hasWebGL2(),
      saveData: nav.connection?.saveData === true,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      contextLostBefore: readSessionFlag(CONTEXT_LOST_KEY),
      viewportWidth: window.innerWidth,
      deviceMemory: nav.deviceMemory,
      hardwareConcurrency: nav.hardwareConcurrency,
    })
    resolved.value = true
  }

  /** Marca la sesión tras un `webglcontextlost` para no volver a intentarlo. */
  function markContextLost() {
    tier.value = 'static'
    try {
      sessionStorage.setItem(CONTEXT_LOST_KEY, '1')
    } catch {
      /* almacenamiento no disponible: se ignora */
    }
  }

  onMounted(resolve)

  return { tier: readonly(tier), resolved: readonly(resolved), markContextLost }
}
