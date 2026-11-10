<script setup lang="ts">
/**
 * Puerta de entrada de toda escena 3D (spec 08 §1.2).
 * - SSR: renderiza el póster (o un hueco del mismo tamaño) → sin CLS y sin WebGL en servidor.
 * - Cliente: si el nivel no es 'static', carga la escena de forma diferida cuando la sección se acerca
 *   al viewport y: en `full`, el navegador está ocioso; en `lite`, el usuario interactúa por primera vez
 *   (scroll, toque, tecla; spec 03 §6 "o al interactuar"). Así el chunk de three y el GLB no compiten con la
 *   carga inicial en móvil: el póster es el primer fotograma de la escena. Funde póster → canvas en `ready`.
 * - `contextlost`: vuelve al póster y marca la sesión para no reintentar.
 *
 * Contrato de la escena cargada: emite `ready` (primer frame con contenido) y `contextlost`.
 */
import type { Component } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Import dinámico de la escena, p. ej. () => import('./FootAnatomy.client.vue') */
    loader: () => Promise<Component | { default: Component }>
    /**
     * Ruta del póster en /public, sin extensión: se sirven .avif y .webp (1600 px) y, si `posterSmall`,
     * también las variantes `-800` (tools/assets/posters.mjs). Opcional en el laboratorio.
     */
    poster?: string
    /** Hay variantes de 800 px del póster. */
    posterSmall?: boolean
    /** Atributo `sizes` del póster. */
    posterSizes?: string
    posterAlt?: string
    /** Relación de aspecto del contenedor, p. ej. '1 / 1' o '4 / 3'. */
    aspectRatio?: string
    /** Props que se pasan a la escena. */
    sceneProps?: Record<string, unknown>
    /** El póster es candidato a LCP (hero): se pide con prioridad alta. */
    priority?: boolean
  }>(),
  {
    poster: undefined,
    posterSmall: false,
    posterSizes: '(min-width: 1024px) 50vw, 100vw',
    posterAlt: '',
    aspectRatio: '1 / 1',
    sceneProps: () => ({}),
    priority: false,
  },
)

const emit = defineEmits<{ ready: []; fallback: [reason: 'static' | 'contextlost' | 'error'] }>()

const { tier, resolved, markContextLost } = useDeviceTier()
const root = ref<HTMLElement | null>(null)
const nearViewport = ref(false)
const idle = ref(false)
const sceneReady = ref(false)
const failed = ref(false)
const slowLoad = ref(false)

const sceneComponent = shallowRef<Component | null>(null)

const shouldLoad = computed(
  () => resolved.value && tier.value !== 'static' && nearViewport.value && idle.value && !failed.value,
)

let observer: IntersectionObserver | undefined
let slowTimer: ReturnType<typeof setTimeout> | undefined
let idleFallbackTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  if (!root.value) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        nearViewport.value = true
        observer?.disconnect()
      }
    },
    { rootMargin: '100% 0px' },
  )
  observer.observe(root.value)

  const markIdle = () => (idle.value = true)
  if (tier.value === 'lite') {
    for (const type of INTERACTION_EVENTS)
      window.addEventListener(type, onFirstInteraction, { passive: true })
    return
  }
  if ('requestIdleCallback' in window) window.requestIdleCallback(markIdle, { timeout: 2500 })
  // Respaldo: algunos navegadores no ejecutan requestIdleCallback en pestañas en segundo plano.
  idleFallbackTimer = setTimeout(markIdle, 'requestIdleCallback' in window ? 3000 : 800)
})

const INTERACTION_EVENTS = ['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll'] as const
function removeInteractionListeners() {
  for (const type of INTERACTION_EVENTS) window.removeEventListener(type, onFirstInteraction)
}
function onFirstInteraction() {
  removeInteractionListeners()
  idle.value = true
}

watch(
  () => resolved.value && tier.value === 'static',
  (isStatic) => {
    if (isStatic) emit('fallback', 'static')
  },
)

watch(shouldLoad, async (load) => {
  if (!load || sceneComponent.value) return
  slowTimer = setTimeout(() => (slowLoad.value = true), 600)
  try {
    const mod = await props.loader()
    sceneComponent.value = markRaw('default' in mod ? mod.default : mod)
  } catch (error) {
    console.error('[SceneGate] No se pudo cargar la escena', error)
    failed.value = true
    emit('fallback', 'error')
  }
})

function srcset(ext: 'avif' | 'webp') {
  return props.posterSmall
    ? `${props.poster}-800.${ext} 800w, ${props.poster}.${ext} 1600w`
    : `${props.poster}.${ext}`
}

function onSceneReady() {
  clearTimeout(slowTimer)
  slowLoad.value = false
  sceneReady.value = true
  emit('ready')
}

function onContextLost() {
  markContextLost()
  failed.value = true
  sceneReady.value = false
  emit('fallback', 'contextlost')
}

onBeforeUnmount(() => {
  observer?.disconnect()
  clearTimeout(slowTimer)
  clearTimeout(idleFallbackTimer)
  removeInteractionListeners()
})
</script>

<template>
  <div ref="root" class="relative isolate w-full" :style="{ aspectRatio }">
    <!-- Póster: presente desde el HTML inicial -->
    <picture
      v-if="poster"
      class="absolute inset-0 transition-opacity duration-(--dur-reveal) ease-out-soft motion-reduce:transition-none"
      :class="sceneReady ? 'opacity-0' : 'opacity-100'"
    >
      <source :srcset="srcset('avif')" :sizes="posterSmall ? posterSizes : undefined" type="image/avif" />
      <img
        :src="`${poster}.webp`"
        :srcset="posterSmall ? srcset('webp') : undefined"
        :sizes="posterSmall ? posterSizes : undefined"
        :alt="posterAlt"
        class="size-full object-contain"
        :decoding="priority ? 'sync' : 'async'"
        :fetchpriority="priority ? 'high' : 'low'"
      />
    </picture>
    <div
      v-else
      class="absolute inset-0 rounded-l bg-light-blue/60 transition-opacity duration-(--dur-reveal) ease-out-soft motion-reduce:transition-none"
      :class="sceneReady ? 'opacity-0' : 'opacity-100'"
      aria-hidden="true"
    />

    <!-- Escena 3D (solo cliente) -->
    <ClientOnly>
      <div
        v-if="sceneComponent && !failed"
        class="absolute inset-0 transition-opacity duration-(--dur-reveal) ease-out-soft motion-reduce:transition-none"
        :class="sceneReady ? 'opacity-100' : 'opacity-0'"
        aria-hidden="true"
      >
        <component
          :is="sceneComponent"
          v-bind="sceneProps"
          @ready="onSceneReady"
          @contextlost="onContextLost"
        />
      </div>
    </ClientOnly>

    <p
      v-if="slowLoad && !sceneReady"
      class="absolute inset-x-0 bottom-4 text-center text-sm text-text-secondary"
      role="status"
    >
      Cargando modelo 3D…
    </p>
  </div>
</template>
