<script setup lang="ts">
/**
 * Navbar global «camaleón». Arriba del todo es transparente e integrada en la página (logo completo, enlaces
 * y «Pedir cita» sobre el fondo). Al hacer scroll se encoge en una píldora flotante translúcida (solo el
 * símbolo del logo). Cambia de tema (hueso / cyan / tinta) según el capítulo que tiene debajo
 * (`data-nav-theme` en cada sección).
 * - «Servicios» es un enlace directo a /servicios y, con su flecha, despliega un panel con los cinco servicios
 *   en bento grid (solo ≥ 1024 px; se abre al pasar el puntero o con la flecha; Esc lo cierra).
 * - ≥ 1024 px: enlaces + «Pedir cita».
 * - < 1024 px: «Menú» abre un panel de tinta a pantalla completa con los enlaces en tipografía monumental
 *   (foco atrapado, Esc, resto de la página `inert`, scroll bloqueado, se cierra al navegar).
 */
import { site } from '~/data/site'
import { services, servicePath } from '~/data/services'

type NavTheme = 'blue' | 'ink' | 'bone'

const route = useRoute()
const clinic = useClinic()
const scrolled = ref(false)
const open = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const header = ref<HTMLElement | null>(null)
const megaButton = ref<HTMLButtonElement | null>(null)

/* ----- Panel de Servicios (bento) ----- */
const megaOpen = ref(false)
let megaTimer: ReturnType<typeof setTimeout> | undefined
function openMega(e?: PointerEvent) {
  if (e && e.pointerType !== 'mouse') return
  clearTimeout(megaTimer)
  megaTimer = setTimeout(() => (megaOpen.value = true), 90)
}
function closeMega(e?: PointerEvent, delay = 160) {
  if (e && e.pointerType !== 'mouse') return
  clearTimeout(megaTimer)
  megaTimer = setTimeout(() => (megaOpen.value = false), delay)
}
function toggleMega() {
  clearTimeout(megaTimer)
  megaOpen.value = !megaOpen.value
}
function onFocusOut(e: FocusEvent) {
  const next = e.relatedTarget as Node | null
  if (!next || !header.value) return
  const zone = header.value.querySelectorAll('.nav-item--mega, .svcmenu')
  if (![...zone].some((z) => z.contains(next))) closeMega(undefined, 0)
}

// SSR y primer pintado: hueso (el hero de la Home también lo es). El cliente corrige con lo que hay debajo.
const detected = ref<NavTheme>('bone')
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
  if (e.key === 'Escape' && megaOpen.value) {
    e.preventDefault()
    megaOpen.value = false
    megaButton.value?.focus()
    return
  }
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
    megaOpen.value = false
    closeMenu(false)
    await nextTick()
    // La página nueva se monta tras la transición: se comprueba también un poco después
    detectTheme()
    setTimeout(detectTheme, 700)
  },
)

const mq = import.meta.client ? window.matchMedia('(min-width: 1024px)') : undefined
const onBreakpoint = (e: MediaQueryListEvent) => e.matches && closeMenu(false)

/* Cierra el panel de Servicios al pulsar fuera o con Esc aunque el foco no esté en la cabecera */
function onDocPointerDown(e: PointerEvent) {
  if (megaOpen.value && header.value && !header.value.contains(e.target as Node)) megaOpen.value = false
}
function onDocKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && megaOpen.value) megaOpen.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointerDown)
  document.addEventListener('keydown', onDocKeydown)
  onScroll()
  detectTheme()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  mq?.addEventListener('change', onBreakpoint)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointerDown)
  document.removeEventListener('keydown', onDocKeydown)
  cancelAnimationFrame(frame)
  clearTimeout(megaTimer)
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
    :class="[`theme-${theme}`, { 'is-scrolled': scrolled && !open, 'is-open': open, 'has-mega': megaOpen }]"
    @keydown="onKeydown"
    @focusout="onFocusOut"
  >
    <div class="nav-shell">
    <div class="nav-grid">
      <NuxtLink to="/" class="brand relative z-10" aria-label="Valdepodo, inicio">
        <!-- El símbolo (262 × 472) se dimensiona por anchura: BrandLogo fija height: auto -->
        <BrandLogo variant="symbol" label="" :mono="theme !== 'bone'" class="brand__symbol" />
        <span class="brand__text">
          <BrandLogo variant="wordmark" label="" :mono="theme !== 'bone'" class="brand__wordmark" />
        </span>
      </NuxtLink>

      <nav class="hidden lg:block" aria-label="Principal">
        <ul class="nav-list">
          <li v-for="item in site.nav" :key="item.to">
            <div
              v-if="item.to === '/servicios'"
              class="nav-item--mega"
              @pointerenter="openMega"
              @pointerleave="closeMega"
            >
              <NuxtLink
                :to="item.to"
                class="nav-link nav-link--mega"
                :aria-current="isActive(item.to) ? 'page' : undefined"
                >{{ item.label }}</NuxtLink
              >
              <button
                ref="megaButton"
                type="button"
                class="nav-chevron"
                aria-controls="mega-servicios"
                :aria-expanded="megaOpen"
                aria-label="Ver los servicios"
                @click="toggleMega"
              >
                <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" />
                </svg>
              </button>
            </div>
            <NuxtLink
              v-else
              :to="item.to"
              class="nav-link"
              :aria-current="isActive(item.to) ? 'page' : undefined"
              >{{ item.label }}</NuxtLink
            >
          </li>
        </ul>
      </nav>

      <div class="nav-end relative z-10">
        <div class="hidden lg:block">
          <BaseButton size="sm" class="nav-cta" variant="primary" :to="site.cta.to" arrow>
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
    </div>

    <!-- Servicios en bento grid (≥ 1024 px) -->
    <Transition name="svcmenu">
      <div
        v-show="megaOpen"
        id="mega-servicios"
        class="svcmenu hidden lg:flex"
        @pointerenter="openMega"
        @pointerleave="closeMega"
      >
        <div class="svcmenu__panel">
          <ul class="bento" role="list">
            <li v-for="(service, i) in services" :key="service.slug" :class="`bento__item bento__item--${i + 1}`">
              <NuxtLink :to="servicePath(service.slug)" class="bento__tile">
                <span class="bento__name">{{ service.name }}</span>
                <BaseIcon name="arrow-up-right" class="bento__go" />
              </NuxtLink>
            </li>
          </ul>
          <NuxtLink to="/servicios" class="svcmenu__all">Ver todos los servicios</NuxtLink>
        </div>
      </div>
    </Transition>

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
/* La cabecera ocupa todo el ancho pero no captura clics fuera de la píldora y del panel */
.site-navbar {
  --nav-fg: var(--color-ink);
  --glass-bg: rgb(6 26 44 / 0.06);
  --glass-border: rgb(6 26 44 / 0.14);
  --pill-bg: rgb(241 239 233 / 0.74);
  --pill-border: rgb(6 26 44 / 0.1);
  --panel-bg: rgb(241 239 233 / 0.94);
  --underline: var(--color-coral);
  color: var(--nav-fg);
  pointer-events: none;
  transition: color var(--dur-base) var(--ease-out-soft);
}
.theme-blue {
  --pill-bg: rgb(234 248 252 / 0.78);
  --pill-border: rgb(6 26 44 / 0.12);
  --panel-bg: rgb(234 248 252 / 0.95);
}
.theme-ink {
  --nav-fg: var(--color-bone);
  --glass-bg: rgb(255 255 255 / 0.12);
  --glass-border: rgb(255 255 255 / 0.28);
  --pill-bg: rgb(6 26 44 / 0.7);
  --pill-border: rgb(255 255 255 / 0.16);
  --panel-bg: rgb(6 26 44 / 0.94);
}

/* ----- Cabecera camaleón: transparente arriba, píldora flotante con scroll ----- */
.nav-shell {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  width: calc(100% - 2 * var(--gutter));
  max-width: var(--container-wide);
  height: var(--nav-h);
  margin-inline: auto;
  padding-inline: 0;
  pointer-events: auto;
  transition:
    max-width 650ms var(--ease-in-out-soft),
    height 650ms var(--ease-in-out-soft),
    margin-top 650ms var(--ease-in-out-soft),
    padding-inline 650ms var(--ease-in-out-soft);
}
/* La píldora (fondo, borde y desenfoque) vive en una capa propia: así el hero no se desenfoca arriba del todo */
.nav-shell::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: var(--radius-m);
  border: 1px solid var(--pill-border);
  background: var(--pill-bg);
  backdrop-filter: blur(18px) saturate(1.5);
  -webkit-backdrop-filter: blur(18px) saturate(1.5);
  box-shadow: 0 10px 30px -12px rgb(6 26 44 / 0.22);
  opacity: 0;
  transition: opacity 450ms var(--ease-out-soft);
}
.is-scrolled .nav-shell {
  max-width: 66rem;
  height: 4rem;
  margin-top: 0.75rem;
  padding-inline: 1rem 0.625rem;
}
.is-scrolled .nav-shell::before {
  opacity: 1;
}
.is-open .nav-shell::before {
  opacity: 0;
}

.nav-grid {
  display: flex;
  width: 100%;
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

/* ----- Logo: completo arriba del todo; con scroll, solo el símbolo ----- */
.brand {
  display: inline-flex;
  align-items: center;
  justify-self: start;
}
.brand__symbol {
  width: 36px;
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
  width: 200px;
  max-width: none;
}
/* Móvil: el logotipo completo cede ancho al botón «Menú» */
@media (max-width: 480px) {
  .brand__wordmark {
    width: 150px;
  }
  .brand__text {
    margin-left: 0.625rem;
  }
}
.is-scrolled .brand__symbol {
  width: 28px;
}
.is-scrolled .brand__text {
  max-width: 0;
  margin-left: 0;
  opacity: 0;
}

/* ----- Enlaces: texto sobre el fondo, subrayado que se dibuja ----- */
.nav-list {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.nav-item--mega {
  display: flex;
  align-items: center;
}
.nav-link {
  position: relative;
  display: inline-block;
  padding: 0.6rem 0.9rem;
  font-size: 1.0625rem;
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
}
.nav-link::after {
  content: '';
  position: absolute;
  inset: auto 0.9rem 0.3rem;
  height: 2px;
  background: var(--underline);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--dur-base) var(--ease-out-soft);
}
.nav-link[aria-current='page']::after {
  transform: scaleX(1);
}
.nav-link--mega {
  padding-right: 0.25rem;
}
.nav-link--mega::after {
  inset-inline: 0.9rem 0.25rem;
}
.nav-chevron {
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 2rem;
  border-radius: var(--radius-s);
}
.nav-chevron svg {
  width: 0.75rem;
  height: 0.75rem;
  transition: transform var(--dur-base) var(--ease-out-soft);
}
.has-mega .nav-chevron svg {
  transform: rotate(180deg);
}
@media (hover: hover) and (pointer: fine) {
  .nav-link:hover::after {
    transform: scaleX(1);
  }
  .nav-chevron:hover {
    background: var(--glass-bg);
  }
}

.site-navbar .nav-cta {
  min-height: 2.75rem;
  padding-inline: 1.25rem 1.1rem;
  font-size: 0.9375rem;
}

/* ----- Panel de Servicios: bento grid ----- */
.svcmenu {
  position: absolute;
  inset: 100% 0 auto;
  justify-content: center;
  /* El relleno superior hace de puente: el puntero no «sale» al cruzar el hueco */
  padding: 0.5rem var(--gutter) 0;
  pointer-events: auto;
}
.is-scrolled .svcmenu {
  top: calc(100% - 0.5rem);
}
.svcmenu__panel {
  width: min(64rem, 100%);
  padding: 0.75rem;
  border: 1px solid var(--pill-border);
  border-radius: 0.75rem;
  background: var(--panel-bg);
  backdrop-filter: blur(20px) saturate(1.5);
  -webkit-backdrop-filter: blur(20px) saturate(1.5);
  box-shadow: 0 24px 60px -24px rgb(6 26 44 / 0.35);
}
.bento {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(2, 8.5rem);
  gap: 0.5rem;
}
.bento__item {
  min-width: 0;
}
.bento__item--1 {
  grid-column: span 2;
  grid-row: span 2;
}
/* Solo tipografía: sin fotos. Baldosas planas con filete; la principal en cyan */
.bento__tile {
  position: relative;
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid rgb(6 26 44 / 0.12);
  border-radius: var(--radius-m);
  background: rgb(6 26 44 / 0.04);
  color: var(--color-ink);
  padding: 0.875rem 1rem;
  transition:
    transform var(--dur-base) var(--ease-out-soft),
    background-color var(--dur-base) var(--ease-out-soft);
}
.bento__item--1 .bento__tile {
  border-color: transparent;
  background: var(--color-primary);
}
/* Tema oscuro: baldosas claras sobre el panel de tinta (la principal sigue en cyan con texto tinta) */
.theme-ink .bento__tile {
  border-color: rgb(241 239 233 / 0.16);
  background: rgb(241 239 233 / 0.06);
  color: var(--color-bone);
}
.theme-ink .bento__item--1 .bento__tile {
  border-color: transparent;
  background: var(--color-primary);
  color: var(--color-ink);
}
.bento__tile {
  justify-content: flex-end;
}
.bento__name {
  max-width: 14ch;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.25rem;
  line-height: 1;
  letter-spacing: -0.02em;
  text-wrap: balance;
}
.bento__item--1 .bento__name {
  font-size: 2rem;
}
.bento__go {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  opacity: 0.85;
  transition: transform var(--dur-base) var(--ease-out-soft);
}
.svcmenu__all {
  display: block;
  width: fit-content;
  margin: 0.75rem 0.5rem 0.25rem auto;
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 5px;
  text-decoration-color: transparent;
  transition: text-decoration-color var(--dur-base) var(--ease-out-soft);
}
@media (hover: hover) and (pointer: fine) {
  .bento__tile:hover {
    transform: translateY(-2px);
  }
  .bento__tile:hover,
  .bento__item--1 .bento__tile:hover,
  .theme-ink .bento__tile:hover,
  .theme-ink .bento__item--1 .bento__tile:hover {
    background: var(--color-cyan-light);
    color: var(--color-ink);
  }
  .bento__tile:hover .bento__go {
    transform: translate(2px, -2px);
  }
  .svcmenu__all:hover {
    text-decoration-color: currentColor;
  }
}
.bento__tile:focus-visible {
  box-shadow: var(--focus-ring);
}
.svcmenu-enter-active,
.svcmenu-leave-active {
  transition:
    opacity 220ms var(--ease-out-soft),
    transform 260ms var(--ease-out-soft);
}
.svcmenu-enter-from,
.svcmenu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
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
  .nav-shell,
  .nav-shell::before,
  .menu-bar,
  .brand__symbol,
  .brand__text,
  .nav-link::after,
  .bento__tile,
  .svcmenu-enter-active,
  .svcmenu-leave-active {
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
