<script setup lang="ts">
/**
 * Widget de Cloudflare Turnstile (spec 06 §3.2). Solo cliente; el script se carga al montarse (paso de
 * resumen), no en toda la web. Emite el token y lo invalida al caducar. `reset()` para reintentar.
 */
interface TurnstileApi {
  render(el: HTMLElement, options: Record<string, unknown>): string
  reset(id?: string): void
  remove(id?: string): void
}
declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const props = defineProps<{ siteKey: string }>()
const emit = defineEmits<{ token: [value: string] }>()

const el = ref<HTMLElement | null>(null)
let widgetId: string | undefined
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

function loadScript(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  return new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
    if (!script) {
      script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.async = true
      document.head.append(script)
    }
    script.addEventListener('load', () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile')),
    )
    script.addEventListener('error', () => reject(new Error('turnstile')))
  })
}

onMounted(async () => {
  try {
    const api = await loadScript()
    if (!el.value) return
    widgetId = api.render(el.value, {
      sitekey: props.siteKey,
      language: 'es',
      callback: (token: string) => emit('token', token),
      'expired-callback': () => emit('token', ''),
      'error-callback': () => emit('token', ''),
    })
  } catch {
    emit('token', '')
  }
})
onBeforeUnmount(() => window.turnstile?.remove(widgetId))

defineExpose({
  reset: () => {
    emit('token', '')
    window.turnstile?.reset(widgetId)
  },
})
</script>

<template>
  <div ref="el" class="min-h-[65px]" />
</template>
