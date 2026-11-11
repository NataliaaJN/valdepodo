<script setup lang="ts">
/**
 * Navbar global. Fija y casi invisible: logo, cuatro enlaces y la acción. Cambia de tema (hueso / azul / tinta)
 * según el capítulo que tiene debajo (`data-nav-theme` en cada sección), así que siempre se lee sin caja ni
 * sombra; con scroll compacta su altura y toma un vidrio sutil del color del capítulo.
 * - ≥ 1024 px: enlaces en línea + «Pedir cita».
 * - < 1024 px: «Menú» abre un panel de tinta a pantalla completa con los enlaces en tipografía monumental
 *   (foco atrapado, Esc, resto de la página `inert`, scroll bloqueado, se cierra al navegar).
 */
import { site } from '~/data/site'

type NavTheme = 'blue' | 'ink' | 'bone'

const route = useRoute()
const clinic = useClinic()
const scrolled = ref(false)
const open = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const header = ref<HTMLElement | null>(null)

// SSR y primer pintado: la Home abre en azul; el resto, en hueso. El cliente corrige con lo que hay debajo.
const detected = ref<NavTheme>(route.path === '/' ? 'blue' : 'bone')
const theme = computed<NavTheme>(() => (open.value ? 'ink' : detected.value))

function detectTheme() {
  if (!header.value) return
  const x = window.innerWidth / 2
  const y = Math.min(40, window.innerHeight / 2)
  for (const el of document.elementsFromPoint(x, y)) {
    if (header.value.contains(el)) continue
    const host = el.closest<HTMLElement>('[data-nav-theme]')
    if (host) {
      detected.value = host.dataset.navTheme as NavTheme
      return
    }
  }
  detected.value = 'bone'
}

let frame = 0
function onScroll() {
  scrolled.value = window.scrollY > 24
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    detectTheme()
  })
}

function isActive(to: string) {
  const [path, hash] = to.split('#')
  if (hash) return route.path === path && route.hash === `#${hash}`
  // "La clínica" no se marca si el activo es "Equipo" (/conocenos#equipo)
  if (route.hash && site.nav.some((n) => n.to === `${route.path}${route.hash}`)) return false
  return route.path === path || (path !== '/' && route.path.startsWith(`${path}/`))
}

/* ----- Menú móvil ----- */
function setPageInert(value: boolean) {
  for (const el of document.querySelectorAll<HTMLElement>('[data-page-root]')) el.inert = value
  document.documentElement.style.overflow = value ? 'hidden' : ''
}

async function openMenu() {
  open.value = true
  setPageInert(true)
  await nextTick()
  panel.value?.querySelector<HTMLElement>('a, button')?.focus()
}

function closeMenu(returnFocus = true) {
  if (!open.value) return
  open.value = false
  setPageInert(false)
  if (returnFocus) menuButton.value?.focus()
}

function onKeydown(e: KeyboardEvent) {
  if (!open.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    closeMenu()
    return
  }
  if (e.key !== 'Tab' || !header.value) return
  // Foco atrapado en la navbar + panel (incluye el botón de cerrar)
  const focusables = [
    ...header.value.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
  ].filter((el) => el.offsetParent !== null)
  const first = focusables[0]
  const last = focusables.at(-1)
  if (!first || !last) return
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

watch(
  () => route.fullPath,
  async () => {
    closeMenu(false)
    await nextTick()
    // La página nueva se monta tras la transición: se comprueba también un poco después
    detectTheme()
    setTimeout(detectTheme, 700)
  },
)

const mq = import.meta.client ? window.matchMedia('(min-width: 1024px)') : undefined
const onBreakpoint = (e: MediaQueryListEvent) => e.matches && closeMenu(false)

onMounted(() => {
  onScroll()
  detectTheme()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  mq?.addEventListener('change', onBreakpoint)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  mq?.removeEventListener('change', onBreakpoint)
  setPageInert(false)
})
</script>

<template>
  <header
    ref="header"
    class="site-navbar fixed inset-x-0 top-0 z-40"
    :class="[`theme-${theme}`, { 'is-scrolled': scrolled && !open, 'is-open': open }]"
    @keydown="onKeydown"
  >
    <div class="container-wide flex h-full items-center justify-between gap-6">
      <NuxtLink to="/" class="brand relative z-10 flex items-center gap-3" aria-label="Valdepodo, inicio">
        <!-- El símbolo (262 × 472) se dimensiona por anchura: BrandLogo fija height: auto -->
        <BrandLogo variant="symbol" label="" :mono="theme !== 'bone'" class="w-[20px]" />
        <BrandLogo variant="wordmark" label="" :mono="theme !== 'bone'" class="w-[108px]" />
      </NuxtLink>

      <nav class="hidden lg:block" aria-label="Principal">
        <ul class="flex items-center gap-9">
          <li v-for="item in site.nav" :key="item.to">
            <NuxtLink :to="item.to" class="nav-link" :aria-current="isActive(item.to) ? 'page' : undefined">{{
              item.label
            }}</NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="relative z-10 flex items-center gap-3">
        <div class="hidden lg:block">
          <BaseButton size="sm" :variant="theme === 'bone' ? 'primary' : 'on-blue'" :to="site.cta.to">
            {{ site.cta.label }}
          </BaseButton>
        </div>
        <button
          ref="menuButton"
          type="button"
          class="menu-button lg:hidden"
          aria-controls="site-menu"
          :aria-expanded="open"
          @click="open ? closeMenu() : openMenu()"
        >
          <span class="menu-label">{{ open ? 'Cerrar' : 'Menú' }}</span>
          <span class="menu-bars" aria-hidden="true">
            <span class="menu-bar" />
            <span class="menu-bar" />
          </span>
        </button>
      </div>
    </div>

    <!-- Menú a pantalla completa (< 1024 px) -->
    <Transition name="menu">
      <div
        v-show="open"
        id="site-menu"
        ref="panel"
        class="menu-panel lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
      >
        <div class="container-wide flex h-full flex-col pt-28 pb-8">
          <nav aria-label="Principal (móvil)">
            <ul class="grid">
              <li
                v-for="(item, i) in [{ label: 'Inicio', to: '/' }, ...site.nav]"
                :key="item.to"
                class="menu-item"
                :style="{ '--i': i }"
              >
                <NuxtLink
                  :to="item.to"
                  class="menu-link"
                  :aria-current="isActive(item.to) ? 'page' : undefined"
                >
                  <span class="menu-link__n">0{{ i + 1 }}</span
                  >{{ item.label }}
                </NuxtLink>
              </li>
            </ul>
          </nav>
          <div class="menu-foot mt-auto grid gap-3 pt-10">
            <BaseButton variant="on-blue" :to="site.cta.to" arrow>{{ site.cta.label }}</BaseButton>
            <a :href="clinic.phoneHref" class="menu-contact">
              <ContentValue :value="site.phone" />
            </a>
            <a :href="clinic.instagram.url" target="_blank" rel="noopener" class="menu-contact">
              <ContentValue v-slot="{ value }" :value="site.instagram">{{ value.handle }}</ContentValue>
              <span class="sr-only">(Instagram, se abre en una pestaña nueva)</span>
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.site-navbar {
  --nav-fg: var(--color-ink);
  --nav-bg: rgb(241 239 233 / 0.8);
  height: var(--nav-h);
  color: var(--nav-fg);
  border-bottom: 1px solid transparent;
  transition:
    height var(--dur-base) var(--ease-out-soft),
    background-color var(--dur-base) var(--ease-out-soft),
    color var(--dur-base) var(--ease-out-soft),
    border-color var(--dur-base) var(--ease-out-soft);
}
.theme-blue {
  --nav-fg: var(--color-bone);
  --nav-bg: rgb(18 112 182 / 0.72);
}
.theme-ink {
  --nav-fg: var(--color-bone);
  --nav-bg: rgb(6 26 44 / 0.72);
}
.site-navbar.is-scrolled {
  height: var(--nav-h-compact);
  background-color: var(--nav-bg);
  backdrop-filter: blur(16px) saturate(1.2);
  border-bottom-color: color-mix(in srgb, var(--nav-fg) 14%, transparent);
}
.site-navbar.is-open {
  background-color: transparent;
}

.nav-link {
  position: relative;
  display: inline-block;
  font-size: 0.9375rem;
  font-weight: 500;
  padding-block: 0.5rem;
}
.nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.2rem;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform var(--dur-base) var(--ease-out-soft);
}
.nav-link[aria-current='page']::after {
  transform: scaleX(1);
}
@media (hover: hover) and (pointer: fine) {
  .nav-link:hover::after {
    transform: scaleX(1);
    transform-origin: left;
  }
}

.menu-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 44px;
  font-size: 0.9375rem;
  font-weight: 500;
}
/* El CSS con ámbito no está en una capa y ganaría a la utilidad lg:hidden */
@media (min-width: 1024px) {
  .menu-button {
    display: none;
  }
}
.menu-bars {
  display: grid;
  gap: 6px;
}
.menu-bar {
  display: block;
  width: 22px;
  height: 1.5px;
  background: currentColor;
  transition: transform var(--dur-base) var(--ease-out-soft);
}
.is-open .menu-bar:first-child {
  transform: translateY(3.75px) rotate(45deg);
}
.is-open .menu-bar:last-child {
  transform: translateY(-3.75px) rotate(-45deg);
}

.menu-panel {
  position: fixed;
  inset: 0;
  z-index: -1;
  background: var(--color-ink);
  color: var(--color-bone);
  overflow-y: auto;
}
.menu-link {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  border-bottom: 1px solid rgb(241 239 233 / 0.18);
  padding-block: 0.6rem;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(2.75rem, 1.5rem + 7vw, 5.5rem);
  line-height: 1;
  letter-spacing: -0.04em;
}
.menu-link[aria-current='page'] {
  color: var(--color-cyan);
}
.menu-link__n {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: rgb(241 239 233 / 0.6);
}
.menu-contact {
  font-weight: 500;
  color: var(--color-ice-blue);
}

.menu-enter-active,
.menu-leave-active {
  transition: clip-path 700ms var(--ease-in-out-soft);
}
.menu-enter-from,
.menu-leave-to {
  clip-path: inset(0 0 100% 0);
}
.menu-enter-to,
.menu-leave-from {
  clip-path: inset(0 0 0 0);
}
.menu-enter-active .menu-item,
.menu-enter-active .menu-foot {
  animation: menu-item 900ms var(--ease-out-soft) both;
  animation-delay: calc(var(--i, 6) * 60ms + 260ms);
}
@keyframes menu-item {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-navbar,
  .menu-bar,
  .nav-link::after {
    transition: none;
  }
  .menu-enter-active,
  .menu-leave-active {
    transition: opacity 120ms linear;
  }
  .menu-enter-from,
  .menu-leave-to {
    clip-path: none;
    opacity: 0;
  }
  .menu-enter-active .menu-item,
  .menu-enter-active .menu-foot {
    animation: none;
  }
}
</style>
