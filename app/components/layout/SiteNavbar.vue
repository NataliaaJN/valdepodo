<script setup lang="ts">
/**
 * Navbar global. Fija y sin barra: logo a la izquierda, los enlaces en una píldora de vidrio (glassmorphism)
 * centrada y «Pedir cita» redondeado a la derecha. Cambia de tema (hueso / azul / tinta) según el capítulo que
 * tiene debajo (`data-nav-theme` en cada sección).
 * - Arriba del todo: logo completo (símbolo + texto), grande. Con scroll: solo el símbolo, más pequeño.
 * - ≥ 1024 px: píldora de enlaces + «Pedir cita».
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
    // Ni la propia navbar ni el loading de marca (cubre la página en la primera visita)
    if (header.value.contains(el) || el.closest('.brand-intro')) continue
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
  return route.path === to || (to !== '/' && route.path.startsWith(`${to}/`))
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
    <div class="container-wide nav-grid">
      <NuxtLink to="/" class="brand relative z-10" aria-label="Valdepodo, inicio">
        <!-- El símbolo (262 × 472) se dimensiona por anchura: BrandLogo fija height: auto -->
        <BrandLogo variant="symbol" label="" :mono="theme !== 'bone'" class="brand__symbol" />
        <span class="brand__text">
          <BrandLogo variant="wordmark" label="" :mono="theme !== 'bone'" class="brand__wordmark" />
        </span>
      </NuxtLink>

      <nav class="hidden lg:block" aria-label="Principal">
        <ul class="nav-pill">
          <li v-for="item in site.nav" :key="item.to">
            <NuxtLink :to="item.to" class="nav-link" :aria-current="isActive(item.to) ? 'page' : undefined">{{
              item.label
            }}</NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="nav-end relative z-10">
        <div class="hidden lg:block">
          <BaseButton
            size="sm"
            class="nav-cta"
            :variant="theme === 'bone' ? 'primary' : 'on-blue'"
            :to="site.cta.to"
            arrow
          >
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
                v-for="(item, i) in site.nav"
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
  --glass-bg: rgb(255 255 255 / 0.42);
  --glass-border: rgb(255 255 255 / 0.75);
  --pill-on-bg: var(--color-ink);
  --pill-on-fg: var(--color-bone);
  height: var(--nav-h);
  color: var(--nav-fg);
  transition:
    height var(--dur-base) var(--ease-out-soft),
    color var(--dur-base) var(--ease-out-soft);
}
.theme-blue,
.theme-ink {
  --nav-fg: var(--color-bone);
  --glass-bg: rgb(255 255 255 / 0.14);
  --glass-border: rgb(255 255 255 / 0.32);
  --pill-on-bg: rgb(255 255 255 / 0.92);
  --pill-on-fg: var(--color-ink);
}
.site-navbar.is-scrolled {
  height: var(--nav-h-compact);
}

.nav-grid {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
@media (min-width: 1024px) {
  .nav-grid {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
  }
}
.nav-end {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* ----- Logo: completo arriba del todo; con scroll, solo el símbolo y más pequeño ----- */
.brand {
  display: inline-flex;
  align-items: center;
  justify-self: start;
}
.brand__symbol {
  width: 46px;
  flex: none;
  transition: width var(--dur-base) var(--ease-out-soft);
}
.brand__text {
  display: block;
  overflow: hidden;
  max-width: 16rem;
  margin-left: 1rem;
  opacity: 1;
  transition:
    max-width var(--dur-base) var(--ease-out-soft),
    margin-left var(--dur-base) var(--ease-out-soft),
    opacity var(--dur-fast) linear;
}
.brand__wordmark {
  display: block;
  width: 230px;
  max-width: none;
}
.is-scrolled .brand__symbol {
  width: 38px;
}
.is-scrolled .brand__text {
  max-width: 0;
  margin-left: 0;
  opacity: 0;
}

/* ----- Píldora de enlaces con vidrio ----- */
.nav-pill {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3125rem;
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  background: var(--glass-bg);
  backdrop-filter: blur(18px) saturate(1.4);
  -webkit-backdrop-filter: blur(18px) saturate(1.4);
  box-shadow:
    0 8px 28px rgb(6 26 44 / 0.08),
    inset 0 1px 0 rgb(255 255 255 / 0.35);
}
.nav-link {
  display: inline-block;
  padding: 0.6rem 1.25rem;
  border-radius: 999px;
  font-size: 1.0625rem;
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
  transition:
    background-color var(--dur-base) var(--ease-out-soft),
    color var(--dur-base) var(--ease-out-soft);
}
.nav-link[aria-current='page'] {
  background: var(--pill-on-bg);
  color: var(--pill-on-fg);
}
@media (hover: hover) and (pointer: fine) {
  .nav-link:not([aria-current='page']):hover {
    background: color-mix(in srgb, var(--nav-fg) 12%, transparent);
  }
}

/* «Pedir cita» redondeado (solo en la navbar; el botón del sistema mantiene su radio) */
.site-navbar .nav-cta {
  min-height: 3rem;
  padding-inline: 1.5rem 1.25rem;
  border-radius: 999px;
  font-size: 1rem;
}

.menu-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 44px;
  padding-inline: 1.125rem;
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  background: var(--glass-bg);
  backdrop-filter: blur(18px) saturate(1.4);
  -webkit-backdrop-filter: blur(18px) saturate(1.4);
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
  .brand__symbol,
  .brand__text,
  .nav-link {
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
