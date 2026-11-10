# VALDEPODO — ARQUITECTURA Y PLAN DE IMPLEMENTACIÓN

> Versión 2 · 10/11/2026 · Relacionado: [01-research.md](01-research.md) · [3d-pipeline.md](3d-pipeline.md) · [specs/](specs/)
> Regla: cada fase termina en un **punto de validación** (gate). No se empieza la siguiente sin aprobación.
> **Cambio v2:** el plan se reordena para **validar primero la viabilidad de los recursos 3D** antes de desarrollar el resto de la web.

---

## 1. Principios

1. **Contenido primero, espectáculo después.** Toda página es legible, navegable y convierte sin JavaScript pesado, sin WebGL y sin animación. El 3D y el scroll son mejoras progresivas.
2. **Mobile y desktop se diseñan a la vez.** Cada spec define el comportamiento por breakpoint.
3. **Nada inventado.** Todo dato pendiente usa el sistema de marcadores `pending()` (spec 09); el build de producción falla si queda alguno.
4. **Una sola fuente de verdad:** tokens en CSS `@theme`, contenido en `app/data/`, esquemas en `shared/schemas/`, movimiento en `app/motion/` y parámetros 3D en `tools/blender/config/`.
5. **Complejidad acotada:** solo tres experiencias inmersivas (pie 3D, estudio biomecánico, plantillas). El resto usa el lenguaje de movimiento común.
6. **Riesgo primero:** lo más incierto (el pie anatómico) se valida antes de invertir en diseño de páginas.

---

## 2. Arquitectura recomendada

### 2.1. Estrategia de renderizado (Nuxt hybrid rendering)

| Ruta                           | Estrategia                                                                        | Motivo                                                           |
| ------------------------------ | --------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Todas las páginas de contenido | **Prerender (SSG)** vía `routeRules: { '/**': { prerender: true } }`              | Contenido estático, máximo SEO y CWV, CDN.                       |
| `/api/cita`                    | **Función serverless** (Nitro)                                                    | Validación, antispam y envío de correo con secretos en servidor. |
| Componentes WebGL              | **Solo cliente** (`.client.vue` / `<ClientOnly>`) con póster SSR del mismo tamaño | Evitar errores de SSR/hidratación y CLS.                         |

Despliegue: Vercel o Netlify, con el preset de Nitro correspondiente. Ambos sirven SSG + funciones.

### 2.2. Estructura de carpetas (Nuxt 4)

```
valdepodo/
├─ app/
│  ├─ app.vue                     # layout raíz, intro de marca, transiciones
│  ├─ app.config.ts
│  ├─ assets/
│  │  ├─ css/
│  │  │  ├─ main.css              # @import tailwind + @theme (tokens) + base
│  │  │  ├─ typography.css
│  │  │  └─ motion.css            # transiciones CSS comunes, reduced-motion
│  │  └─ svg/                     # lenguaje gráfico (huellas, contornos, líneas)
│  ├─ components/
│  │  ├─ base/                    # BaseButton, BaseLink, BaseEyebrow, BaseIcon, BaseTag, PendingBadge…
│  │  ├─ layout/                  # SiteNavbar, SiteMobileMenu, SiteFooter, SkipLink, BrandIntro, PageHero
│  │  ├─ graphics/                # FootprintTrail, FootOutline, PressureMap, OrganicLines, FlowPath, AnatomyLabel
│  │  ├─ sections/                # CtaBlock, ValuesStrip, ReviewsSection, SectionHeading, StepList, MediaMosaic
│  │  ├─ services/                # ServiceShowcase, ServiceFeature, TreatmentRow, BiomechSequence, InsoleStory…
│  │  ├─ team/                    # TeamCard, TeamGrid
│  │  ├─ booking/                 # BookingWizard, BookingStep*, OptionCard, BookingSummary, BookingProgress
│  │  ├─ contact/                 # ContactInfo, MapFacade, OpeningHours
│  │  └─ three/                   # SceneGate, FootAnatomy.client, InsoleLayers.client, FiberField.client
│  ├─ composables/                # useDeviceTier, useReducedMotion, useGsapContext, useScrollScene, useBookingDraft, useNavbarState
│  ├─ data/                       # contenido tipado: site.ts, services.ts, team.ts, reviews.ts, values.ts, legal.ts
│  ├─ layouts/default.vue
│  ├─ motion/                     # presets GSAP (reveal, stagger, pinSequence), tokens de duración/easing
│  ├─ pages/
│  │  ├─ index.vue
│  │  ├─ servicios/index.vue
│  │  ├─ servicios/estudio-biomecanico.vue
│  │  ├─ servicios/plantillas-personalizadas.vue
│  │  ├─ servicios/podologia-general.vue
│  │  ├─ servicios/podologia-infantil.vue
│  │  ├─ servicios/pie-diabetico.vue
│  │  ├─ conocenos.vue
│  │  ├─ pedir-cita.vue
│  │  ├─ contacto.vue
│  │  ├─ aviso-legal.vue · privacidad.vue · cookies.vue · creditos.vue
│  │  └─ _lab/ (solo dev)         # laboratorio de experiencias: pie, biomecánico, plantilla, sistema
│  ├─ plugins/gsap.client.ts      # registra ScrollTrigger, config global
│  └─ error.vue                   # 404/500 con la identidad de marca
├─ server/
│  ├─ api/cita.post.ts
│  └─ utils/
│     ├─ mailer/ (index.ts → interfaz Mailer; resend.ts | brevo.ts)
│     ├─ booking-sink.ts          # adaptador de destino (email hoy, agenda mañana)
│     ├─ antispam.ts              # honeypot, tiempo mínimo, Turnstile, rate limit
│     └─ email-templates/
├─ shared/
│  ├─ schemas/booking.ts          # esquema Zod compartido cliente/servidor
│  ├─ types/                      # tipos de contenido y API
│  └─ utils/pending.ts
├─ public/
│  ├─ models/                     # *.glb optimizados + CREDITS.md
│  └─ images/
│     ├─ 3d-fallbacks/            # pósters AVIF/WebP de las escenas 3D
│     └─ …                        # fotos (o en assets si pasan por @nuxt/image)
├─ tools/                         # pipeline 3D, separado de la app (ver docs/3d-pipeline.md)
│  ├─ blender/                    # scripts Python (bpy)
│  │  └─ config/                  # parámetros JSON (foot, insole, render)
│  ├─ assets/                     # gltf-transform, manifiesto, check de créditos
│  └─ check-pending.ts            # falla el build de producción si quedan marcadores pending
├─ tests/ (unit/, components/, e2e/)
├─ docs/
└─ nuxt.config.ts · eslint.config.mjs · .prettierrc · vitest.config.ts · .env.example
```

> Las páginas de servicio son **ficheros explícitos** (no `[slug].vue`) porque cada una tiene una composición distinta; comparten componentes y datos de `app/data/services.ts`.
> `_lab/` se excluye del build de producción y del sitemap; sirve para desarrollar y validar las experiencias aisladas.

### 2.3. Componentes reutilizables clave

| Componente                                                                                 | Usado en                                   |
| ------------------------------------------------------------------------------------------ | ------------------------------------------ |
| `BaseButton` (primary, secondary, ghost, on-dark; tamaños; como `<NuxtLink>` o `<button>`) | Todo                                       |
| `SectionHeading` (eyebrow + título con palabra destacada + intro)                          | Todo                                       |
| `PageHero` (variantes: `split-visual`, `centered`, `editorial`)                            | Servicios, Conócenos, Contacto, Pedir cita |
| `CtaBlock` (titular + texto + botón + recurso gráfico, p. ej. huellas)                     | Final de cada página                       |
| `FootprintTrail` (huellas SVG con aparición progresiva)                                    | CTA Home, Estudio biomecánico, Infantil    |
| `StepList` (pasos numerados con línea de recorrido)                                        | Plantillas, Filosofía, Infantil            |
| `TreatmentRow` (fila editorial numerada)                                                   | Podología general                          |
| `MediaMosaic` (imagen principal + secundarias + lightbox)                                  | Conócenos                                  |
| `SceneGate` (niveles `full`/`lite`/`static`, carga diferida, póster, errores WebGL)        | Las experiencias 3D                        |
| `PendingBadge` (solo dev/preview)                                                          | Contenido provisional                      |

### 2.4. Capas transversales

- **Movimiento:** `useGsapContext(scope, setup)` envuelve `gsap.context` + `gsap.matchMedia` (breakpoints y `prefers-reduced-motion`) y revierte al desmontar. Presets en `app/motion/`. CSS para hovers y transiciones simples.
- **Nivel de dispositivo:** `useDeviceTier()` → `'full' | 'lite' | 'static'` (spec 08).
- **SEO:** `useSeoMeta` por página + schema.org (clínica en el layout, `Service`/`MedicalProcedure` en servicios, `BreadcrumbList`), sitemap y robots.
- **Contenido:** ficheros tipados en `app/data/` con helper `pending()`.

---

## 3. Fases

Cada fase lista **entregables** y **gate** (criterios de cierre). Las fases 2, 3 y 4 son tres elementos 3D **independientes**: si uno se bloquea, los otros siguen.

### FASE 0 — Auditoría y planificación ✅

- Entregables: `01-research.md` (v2), `02-plan.md` (v2), `3d-pipeline.md`, `specs/`.
- **Gate 0:** validación de este research y envío a la clínica de las preguntas (research §12) y de la lista de recursos (research §13.4).

### FASE 1 — Preparación del entorno y arquitectura del proyecto ✅ (10/11/2026)

> **Resultado:** Gate 1 cumplido. Nuxt 4.6.4 + TS 6.0 + Tailwind 4.3 + GSAP 3.15 + three 0.187 / TresJS core 5.10; lint, typecheck, 16 tests y build (prerender) en verde. Blender 5.2.4 LTS instalado (portable, SHA-256 verificado). Cadena `3d:smoke` (Blender → GLB 15 KB → meshopt 4,5 KB → comprobación de créditos y presupuesto) y carga en `/_lab/escena` verificadas en navegador.
> **Desviaciones:** TresJS sin `@tresjs/nuxt`; TS 6.0 en lugar de 7; tokens con los colores del SVG del logo (`#1270B6`, `#1EABE1`). Ver research, registro de revisión. Scripts de laboratorio: `3d:check-env`, `3d:test-cube`, `3d:optimize`, `3d:check`, `3d:smoke`.

- **App:**
  - scaffolding Nuxt 4 + TS strict, Tailwind v4 (Vite), ESLint + Prettier, Vitest, módulos aprobados;
  - `routeRules`, `.env.example`, rama `main` y primer commit;
  - CI básica: lint, typecheck, test, check-pending.
- **Base visual mínima:** tokens provisionales en `@theme` con los colores del logo (`#1070B4`, `#1CA8E0`) y la paleta de apoyo; tipografías candidatas; `BaseButton`; layout vacío.
- **Infraestructura 3D en la app:** TresJS instalado, `SceneGate`, `useDeviceTier`, plugin GSAP y página `_lab/` vacía.
- **Pipeline 3D** ([3d-pipeline.md](3d-pipeline.md)):
  - Blender 5.2 LTS instalado y `BLENDER_BIN` configurado;
  - `@gltf-transform/cli`;
  - esqueleto `tools/blender/`, `lib/` y `config/`;
  - scripts npm `3d:*`, `manifest.json` y `.gitignore`.
- **Gate 1:**
  - `npm run dev`, `build`, `lint` y `test` en verde;
  - `3d:*` ejecutan un script de prueba (cubo → GLB → optimizado → cargado en `_lab/`) de extremo a extremo.

### FASE 2 — Prototipo anatómico del pie y validación de calidad (ruta crítica) 🟡 prototipo listo, esperando Gate 2

> **Resultado (10/11/2026):** viable con BodyParts3D 4.0 (CC BY 4.0) para exterior, huesos, músculos (con sus tendones) y tendón de Aquiles. Prototipo de 73k triángulos y 563 KB, visible en `/_lab/pie` con el estilo de marca. Ligamentos: solo esquemáticos (Z-Anatomy, CC BY-SA). Detalle y opciones en [fase2-viabilidad-pie.md](fase2-viabilidad-pie.md). **Bloqueo:** revisión anatómica de la podóloga y elección de la opción de capas (A/B/C).

- Descargar fuentes con confirmación (BodyParts3D 4.0, Z-Anatomy) y registrar checksums.
- `inspect_source.py` → **inventario del pie** (capas disponibles, triángulos, calidad de malla, licencia de cada objeto).
- `config/foot.json` (allowlist) + `extract_foot.py` → `foot.raw.glb`.
- `render_validation.py` → renders por capa y vista.
- Primer estilizado en `_lab/pie`: material fresnel azul/cian, cambio de capas, rotación. Sin scroll todavía.
- Medición de peso y FPS: full y lite, en móvil real.
- **Gate 2 (viabilidad)** — revisión de la podóloga + decisión:
  - ✅ capas disponibles aprobadas;
  - 🟡 alcance reducido (exterior + huesos…);
  - ❌ plan B (modelo de pago o encargo, con presupuesto).
  - Decisión de licencia del GLB (CC BY o CC BY-SA) con la clínica.

### FASE 3 — Recursos gráficos del estudio biomecánico 🟡 laboratorio listo, esperando Gate 3

> **Resultado (10/11/2026):** biblioteca SVG en `app/components/graphics/`, estados en `app/data/biomech.ts` y secuencia de 6 fases en `/_lab/biomecanico` (sticky en ≥ 768 px, tarjetas en móvil). Peso 11,6 KB + 2,0 KB gzip. `PressureShader.client` descartado: el filtro SVG basta. Detalle en [fase3-biomecanico.md](fase3-biomecanico.md). **Pendiente:** aprobación visual, FPS en escritorio medio y móvil real, y prueba con reduced motion.

- Biblioteca SVG propia:
  - huellas izquierda/derecha;
  - mapa de presión (gradientes + blur + clip);
  - puntos de apoyo;
  - centro de presiones;
  - líneas de progresión.
- Datos de estados (`app/data/biomech.ts`) y secuencias GSAP de apoyo en la marcha.
- Laboratorio `_lab/biomecanico`: secuencia de 6 fases en escritorio (sticky) y móvil (vertical), con reduced motion.
- Rótulo "Visualización ilustrativa".
- **Gate 3:** aprobación visual; rendimiento ≥ 55 fps en escritorio medio y sin jank en móvil; peso < 30 KB.

### FASE 4 — Plantilla conceptual y animación de fibras 🟡 laboratorio listo, esperando Gate 4

> **Resultado (10/11/2026):** plantilla paramétrica propia en 3 capas (`insole.glb`, 113 KB, 24k triángulos) con pósters AVIF/WebP, explosión con etiquetas y 6.000/1.500 fibras en un único draw call, en `/_lab/plantilla` (scrub en ≥ 768 px, reproducción autónoma en móvil, modo manual). 144 fps en el equipo de desarrollo. Detalle en [fase4-plantilla.md](fase4-plantilla.md). **Pendiente:** aprobación visual (incluido igualar el color póster ↔ escena), FPS en escritorio medio y móvil real, y prueba con reduced motion.

- `config/insole.json` + `build_insole.py` → `insole.glb` por capas (`layer_*`); renders y fallbacks.
- `_lab/plantilla`:
  - explosión de capas controlada por un valor 0→1;
  - etiquetas genéricas;
  - `FiberField` con `InstancedMesh` (6.000 / 1.500 fibras) y `uProgress` de 5 fases.
- **Gate 4:**
  - iteración de parámetros validada visualmente;
  - fibras a ≥ 55 fps en escritorio y ≥ 30 fps en móvil medio;
  - **sin materiales ni procesos atribuidos**.

### FASE 5 — Integración progresiva de las experiencias 3D en Nuxt + propuesta visual 🟡 propuesta lista, esperando Gate 5

> **Resultado (10/11/2026):** Home en código real (navbar, hero con el pie anatómico provisional y secuencia pineada, fragmento de servicios), tipografía A/B con `?tipo=b`, pósters del pie por capa (`npm run 3d:foot-posters`) y las secuencias del biomecánico y de la plantilla montadas en sus páginas. Sin errores de hidratación ni triggers huérfanos; prerender de 10 rutas. Detalle en [fase5-propuesta.md](fase5-propuesta.md). **Pendiente:** aprobación de la dirección artística, Lighthouse móvil y prueba con reduced motion.

- `SceneGate` completo: póster SSR desde `public/images/3d-fallbacks/`, carga diferida, `webglcontextlost`, niveles.
- Coordinación con ScrollTrigger: estado declarativo, `matchMedia` y limpieza en la navegación entre páginas.
- **Propuesta visual de la Home** (requisito de la especificación), en código real:
  - navbar, hero con el pie integrado y su secuencia de scroll;
  - botones, fondos, lenguaje gráfico;
  - un fragmento de servicios;
  - estilo de animación;
  - variantes tipográficas A/B;
  - capturas a 390, 768 y 1440 px.
- Montaje de las secuencias del biomecánico y de la plantilla en sus páginas (estructura mínima, contenido `pending`).
- **Gate 5:**
  - aprobación de la dirección artística (color, tipografía, navbar, hero, 3D, botones, fondos, animación);
  - Lighthouse móvil de la Home ≥ 85;
  - sin errores de hidratación;
  - navegación entre páginas sin triggers huérfanos.

### FASE 6 — Desarrollo del resto de secciones de la web

Orden recomendado; cada bloque con su gate de revisión responsive (8 anchos):

1. Sistema de diseño completo (spec 01) y layout global (spec 02): navbar, menú móvil, footer, transiciones, `error.vue`. Loading de marca **solo con el logo vectorial**.
2. Home completa (spec 03): servicios, valores, reseñas (si hay reales), CTA.
3. Servicios (spec 04): índice, biomecánico, plantillas, podología general, infantil, pie diabético.
4. Conócenos (spec 05).
5. Pedir cita (spec 06): wizard, `/api/cita`, antispam, correos, tests.
6. Contacto (spec 07).
7. Legales y `/creditos`.

### FASE 7 — Optimización, accesibilidad, SEO y pruebas (spec 10)

- Auditoría responsive (8 anchos × todas las páginas), accesibilidad (axe + teclado + lector de pantalla), SEO (metadatos, schema, sitemap), rendimiento (CWV, peso 3D, bundle), pruebas unitarias, de componentes y E2E (si se aprueba).
- **Gate 7:** checklist de aceptación de la spec 10 en verde (excepto contenidos).

### FASE 8 — Validación de contenidos con la podóloga y preparación para producción

- Validación página a página del contenido clínico → eliminación de `pending()`.
- Datos de contacto confirmados, fotos y consentimientos, reseñas con permiso, textos legales revisados, créditos y licencias.
- Producción: variables de entorno, dominio, DNS del correo (SPF/DKIM/DMARC), Turnstile en el dominio real, `check-pending` limpio, `manifest.json` con `validatedBy`, web añadida a la ficha de Google, Search Console, despliegue.
- **Gate 8:** revisión integral con la clínica y envío real de prueba del formulario en producción.

---

## 4. Ruta crítica y dependencias

```
F0 ─► F1 ─┬─► F2 pie (ruta crítica) ──────────┐
          ├─► F3 biomecánico ─────────────────┼─► F5 integración + propuesta visual ─► F6 web ─► F7 ─► F8
          └─► F4 plantilla + fibras ──────────┘
Clínica: logo vectorial (F5 propuesta / F6 loading) · revisión anatómica (Gate 2) · fotos y consentimientos (F6 Conócenos)
         contenido clínico (F6 servicios / F8) · datos de contacto, correo y legales (F6 cita y contacto / F8)
```

- F2, F3 y F4 pueden ir en paralelo tras F1; **F2 tiene prioridad** porque condiciona el hero.
- Si el Gate 2 se retrasa por la revisión de la podóloga, F3 y F4 avanzan y la propuesta visual (F5) puede usar el prototipo del pie marcado como pendiente.
- Pedir cita y Contacto (F6.5-6.6) no dependen del 3D: pueden adelantarse si faltan recursos visuales.

---

## 5. Definición de "hecho" por tarea

- Funciona en 360, 390, 430, 768, 1024, 1280, 1440 y 1920 px sin scroll horizontal.
- Navegable por teclado, foco visible, sin dependencia exclusiva de hover o color.
- `prefers-reduced-motion` respetado.
- Sin errores en consola ni warnings de hidratación.
- Lint, typecheck y tests en verde.
- Contenido no confirmado marcado con `pending()`.
- Metadatos SEO de la página definidos.
- En el caso de los modelos 3D: presupuestos cumplidos, fallback regenerado, entrada en `CREDITS.md` y `manifest.json`.
