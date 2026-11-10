# SPEC 10 — CALIDAD: RESPONSIVE, ACCESIBILIDAD, SEO, RENDIMIENTO, PRUEBAS Y ACEPTACIÓN

## 1. Responsive

- Anchos de prueba obligatorios, **en todas las páginas**: 360 · 390 · 430 · 768 · 1024 · 1280 · 1440 · 1920 px (+ orientación horizontal en móvil para hero y wizard).
- Comprobaciones por ancho: sin scroll horizontal (`document.documentElement.scrollWidth <= innerWidth`), titulares sin desbordes ni cortes de palabra feos, imágenes con proporción correcta, áreas táctiles ≥ 44×44 (objetivo 48), navbar y menú funcionales, secuencias de scroll correctas (o su variante móvil).
- Automatización propuesta (si se aprueba Playwright): script que recorre rutas × anchos, toma capturas y verifica `scrollWidth`. Si no se aprueba: checklist manual con DevTools.
- Dispositivos reales mínimos antes del lanzamiento: un iPhone (Safari) y un Android de gama media.

## 2. Accesibilidad (objetivo WCAG 2.2 AA)

- HTML semántico: `header/nav/main/footer`, un H1 por página, jerarquía sin saltos, listas reales, `<address>`, `<dialog>`.
- Teclado: todo operable; orden lógico; foco visible (token `focus-ring`); sin trampas de foco salvo en modales/menú (con `Esc`).
- Contraste: según research §6.1 y tokens derivados. Bordes de controles ≥ 3:1.
- Formularios: labels visibles, errores textuales asociados, `autocomplete`, resumen de errores.
- Movimiento: `prefers-reduced-motion` en CSS y en `gsap.matchMedia`; nada esencial depende de la animación; sin parpadeos > 3/s; carruseles sin autoplay no pausable.
- 3D: canvas `aria-hidden`; controles reales (botones) y contenido equivalente en el DOM.
- Imágenes: `alt` descriptivo en fotos con contenido; `alt=""` en decorativas; SVG decorativos `aria-hidden`.
- Idioma `lang="es"`. Enlaces con texto significativo (no "clic aquí").
- Herramientas: `axe` (vía `@axe-core/playwright` o extensión) sin errores; prueba con VoiceOver (iOS) y NVDA (Windows) en Home, Pedir cita y Conócenos.

## 3. SEO

- Por página: `title` único, `meta description`, canonical, Open Graph (`og:title`, `og:description`, `og:image` 1200×630 estático por página), `twitter:card`.
- URLs: las de la especificación (español, sin acentos, kebab-case).
- `sitemap.xml` (excluye `/_sistema`, legales con `priority` baja), `robots.txt` (bloquea previews: `noindex` en entornos no productivos).
- Schema.org: `MedicalClinic`/`Podiatrist` global, `Service`/`MedicalProcedure` por servicio, `BreadcrumbList`, `Person` (equipo, solo datos confirmados). Sin `AggregateRating` salvo reseñas propias verificables (las reseñas de Google no deben marcarse como propias).
- SEO local: NAP consistente, ciudad en títulos clave, enlace a Google Business Profile, contenido útil por servicio.
- Enlazado interno: servicios ↔ servicios relacionados, todas → pedir cita, breadcrumbs en servicios.

## 4. Rendimiento

Objetivos (móvil, Lighthouse/PageSpeed con throttling, y datos de campo cuando haya):

| Métrica                      | Objetivo                                                                    |
| ---------------------------- | --------------------------------------------------------------------------- |
| LCP                          | ≤ 2,5 s (Home incluida)                                                     |
| INP                          | ≤ 200 ms                                                                    |
| CLS                          | ≤ 0,1 (objetivo 0,02)                                                       |
| Lighthouse Performance móvil | ≥ 85 en Home y páginas 3D, ≥ 95 en el resto                                 |
| JS inicial (gzip)            | ≤ 120 KB sin 3D; three/tres en chunk diferido                               |
| Fuentes                      | ≤ 4 ficheros WOFF2, subset latin, preload solo display                      |
| Imágenes                     | AVIF/WebP, `srcset`, lazy fuera del primer viewport, dimensiones explícitas |

Medidas: `@nuxt/image`, `@nuxt/fonts`, carga diferida 3D (spec 08), sin librerías no justificadas, `nuxi analyze` en cada fase, CSS crítico por defecto de Nuxt.

## 5. Pruebas (Vitest + @nuxt/test-utils)

| Ámbito          | Qué                                                                                                                                                                                                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit            | Esquemas Zod, normalizadores, antispam, `useDeviceTier` (con mocks), `pending`/`check-pending`, cálculo de "años de experiencia", "abierto ahora".                                                                                                                   |
| Componentes     | `BaseButton` (variantes/estados), `SiteNavbar` (menú móvil: apertura, `Esc`, foco, cierre al navegar), `BookingWizard` (pasos, validación, borrador, preselección, estados de envío), `TeamCard` (disclosure accesible), `MapFacade` (no carga iframe hasta acción). |
| Servidor        | `/api/cita` con dobles de `Mailer`/Turnstile.                                                                                                                                                                                                                        |
| E2E (propuesto) | Navegación por todas las rutas, flujo de cita, capturas responsive, axe.                                                                                                                                                                                             |
| CI              | lint · typecheck · test · check-pending (modo informe en PR, bloqueante en producción) · build.                                                                                                                                                                      |

## 6. Consola y robustez

- Sin errores ni warnings de hidratación en ninguna ruta.
- Sin 404 de recursos.
- WebGL no disponible → sin errores, fallback visible.
- Funciona con JS desactivado: contenido, navegación y enlaces (el wizard muestra alternativa de contacto por teléfono/email en `<noscript>`).

## 7. Criterios de aceptación (checklist de la especificación maestra)

- [ ] Todas las rutas funcionan (10 páginas + legales + créditos + 404).
- [ ] Todos los enlaces y botones tienen una acción real.
- [ ] Las experiencias 3D funcionan con modelos adecuados y aprobados (Gates 2 y 4), con créditos y licencias en `CREDITS.md`.
- [ ] Las animaciones de scroll son fluidas (≥ 50 fps en escritorio medio, sin saltos).
- [ ] Todas las páginas son responsive en los 8 anchos.
- [ ] No existe scroll horizontal accidental.
- [ ] El formulario envía información correctamente (verificado en producción con un envío de prueba).
- [ ] No se simulan reservas confirmadas (textos y correos revisados).
- [ ] Los datos de la clínica son correctos (revisión de la clínica).
- [ ] Las imágenes están optimizadas.
- [ ] La web es accesible (§2).
- [ ] No hay errores importantes en consola.
- [ ] Existen alternativas para dispositivos sin 3D.
- [ ] `check-pending` sin marcadores en producción.
- [ ] La identidad cromática es coherente en todas las páginas (solo tokens; revisión visual).
- [ ] Créditos y licencias de recursos publicados.
- [ ] Textos legales revisados por asesoría.
