<script setup lang="ts">
/**
 * Navbar global (spec 02 §2). Propuesta visual (Fase 5).
 * - Fija; 88 px → 68 px y fondo glass a partir de 24 px de scroll. Arriba es transparente sobre el hero.
 * - ≥ 1024 px: enlaces + "Pedir cita". < 1024 px: logo, "Pedir cita" compacto y menú a pantalla completa
 *   (foco atrapado, Esc, resto de la página `inert`, scroll bloqueado, se cierra al navegar).
 * - Servicios es un enlace directo (spec 02 §2: el submenú se decide en la propuesta; aquí, simplicidad).
 */
import { site } from '~/data/site'

const route = useRoute()
const scrolled = ref(false)
const open = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const header = ref<HTMLElement | null>(null)

function onScroll() {
  scrolled.value = window.scrollY > 24
}

function isActive(to: string) {
  const [path, hash] = to.split('#')
  if (hash) return route.path === path && route.hash === `#${hash}`
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
  () => closeMenu(false),
)

const mq = import.meta.client ? window.matchMedia('(min-width: 1024px)') : undefined
const onBreakpoint = (e: MediaQueryListEvent) => e.matches && closeMenu(false)

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  mq?.addEventListener('change', onBreakpoint)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  mq?.removeEventListener('change', onBreakpoint)
  setPageInert(false)
})
</script>

<template>
  <header
    ref="header"
    class="site-navbar fixed inset-x-0 top-0 z-40"
    :class="{ 'is-scrolled': scrolled || open, 'is-open': open }"
    @keydown="onKeydown"
  >
    <div class="container-site flex h-full items-center justify-between gap-6">
      <NuxtLink to="/" class="relative z-10 flex items-center gap-3" aria-label="Valdepodo, inicio">
        <!-- El símbolo (262 × 472) se dimensiona por anchura: BrandLogo fija height: auto -->
        <BrandLogo variant="symbol" label="" class="w-[22px]" />
        <BrandLogo variant="wordmark" label="" class="w-[112px]" />
      </NuxtLink>

      <nav class="hidden lg:block" aria-label="Principal">
        <ul class="flex items-center gap-8">
          <li v-for="item in site.nav" :key="item.to">
            <NuxtLink :to="item.to" class="nav-link" :aria-current="isActive(item.to) ? 'page' : undefined">{{
              item.label
            }}</NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="relative z-10 flex items-center gap-2">
        <BaseButton size="sm" :to="site.cta.to" :arrow="true" class="max-lg:min-h-10! max-lg:px-4!">
          {{ site.cta.label }}
        </BaseButton>
        <button
          ref="menuButton"
          type="button"
          class="menu-button lg:hidden"
          aria-controls="site-menu"
          :aria-expanded="open"
          :aria-label="open ? 'Cerrar menú' : 'Abrir menú'"
          @click="open ? closeMenu() : openMenu()"
        >
          <span class="menu-bar" aria-hidden="true" />
          <span class="menu-bar" aria-hidden="true" />
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
        <div class="container-site flex h-full flex-col pt-28 pb-10">
          <nav aria-label="Principal (móvil)">
            <ul class="grid gap-2">
              <li
                v-for="(item, i) in [{ label: 'Inicio', to: '/' }, ...site.nav]"
                :key="item.to"
                class="menu-item"
                :style="{ '--i': i }"
              >
                <NuxtLink
                  :to="item.to"
                  class="font-display text-display-m text-deep-blue"
                  :aria-current="isActive(item.to) ? 'page' : undefined"
                  >{{ item.label }}</NuxtLink
                >
              </li>
            </ul>
          </nav>
          <div class="mt-auto grid gap-1 text-text-secondary">
            <ContentValue :value="site.phone" />
            <ContentValue :value="site.instagram" />
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.site-navbar {
  height: var(--nav-h);
  transition:
    height var(--dur-base) var(--ease-out-soft),
    background-color var(--dur-base) var(--ease-out-soft),
    border-color var(--dur-base) var(--ease-out-soft);
  border-bottom: 1px solid transparent;
}
.site-navbar.is-scrolled {
  height: var(--nav-h-compact);
  background-color: rgb(245 248 252 / 0.85);
  backdrop-filter: blur(14px) saturate(1.3);
  border-bottom-color: var(--color-border);
}
.site-navbar.is-open {
  border-bottom-color: transparent;
  background-color: transparent;
  backdrop-filter: none;
}

.nav-link {
  position: relative;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-deep-blue);
  padding-block: 0.5rem;
  transition: color var(--dur-fast) var(--ease-out-soft);
}
.nav-link::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -2px;
  width: 6px;
  height: 6px;
  margin-left: -3px;
  border-radius: 999px;
  background: var(--color-cyan);
  opacity: 0;
  transform: translateY(4px);
  transition:
    opacity var(--dur-fast) var(--ease-out-soft),
    transform var(--dur-fast) var(--ease-out-soft);
}
.nav-link[aria-current='page']::after,
.nav-link:hover::after {
  opacity: 1;
  transform: none;
}
.nav-link:hover {
  color: var(--color-primary-strong);
}

.menu-button {
  display: inline-grid;
  place-content: center;
  gap: 6px;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1.5px solid var(--color-border-strong);
  background: rgb(255 255 255 / 0.6);
}
/* El CSS con ámbito no está en una capa y ganaría a la utilidad lg:hidden */
@media (min-width: 1024px) {
  .menu-button {
    display: none;
  }
}
.menu-bar {
  display: block;
  width: 18px;
  height: 1.5px;
  background: var(--color-deep-blue);
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
  background:
    radial-gradient(60% 45% at 85% 20%, rgb(185 229 243 / 0.7), transparent 70%),
    radial-gradient(50% 40% at 10% 90%, rgb(30 171 225 / 0.18), transparent 70%), var(--color-surface);
  overflow-y: auto;
}
.menu-enter-active,
.menu-leave-active {
  transition:
    opacity var(--dur-base) var(--ease-out-soft),
    transform var(--dur-base) var(--ease-out-soft);
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
.menu-enter-active .menu-item {
  animation: menu-item var(--dur-reveal) var(--ease-out-soft) both;
  animation-delay: calc(var(--i) * 40ms + 80ms);
}
@keyframes menu-item {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-navbar,
  .menu-bar,
  .menu-enter-active,
  .menu-leave-active {
    transition: opacity 120ms linear;
  }
  .menu-enter-from,
  .menu-leave-to {
    transform: none;
  }
  .menu-enter-active .menu-item {
    animation: none;
  }
}
</style>
