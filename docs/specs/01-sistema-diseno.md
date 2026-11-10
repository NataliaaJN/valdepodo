# SPEC 01 — SISTEMA DE DISEÑO

> Fase 1 (tokens provisionales) y Fase 6 (sistema completo) del plan v2. Fuente única: `app/assets/css/main.css` (`@theme` de Tailwind v4). Ningún componente usa HEX sueltos.
> Si el logo vectorial trae colores oficiales distintos, se actualizan **solo** los tokens de marca.
>
> **Actualización v2 (logo):** del raster del logo se han muestreado azul `#1070B4`, cian `#1CA8E0` y gris `#545454` (research §8.1). ⚠️ Recomendación pendiente de confirmar con el vector: `--color-primary: #1070B4` (5,25:1 sobre blanco), `--color-cyan: #1CA8E0` y `--color-primary-strong: #0B5E99` (6,83:1). El cian del logo (2,72:1) mantiene la regla: nunca texto sobre blanco. La tabla de abajo conserva los valores de la especificación como referencia hasta esa confirmación.

## 1. Color

### 1.1. Tokens de marca (paleta oficial propuesta)

```css
@theme {
  /* Principales */
  --color-primary: #087ead;
  --color-cyan: #00a9d0;
  --color-deep-blue: #163c63;
  /* Secundarios */
  --color-ice-blue: #b9e5f3;
  --color-light-blue: #eaf5fa;
  --color-surface: #f5f8fc;
  --color-white: #ffffff;
  /* Neutros */
  --color-text: #24364b;
  --color-text-secondary: #617386;
  --color-border: #dce8ef;

  /* Derivados de accesibilidad (ver research §6.1) */
  --color-primary-strong: #0a6e98; /* enlaces/texto azul pequeño, hover de botón */
  --color-cyan-ink: #007e9e; /* "texto cian" pequeño sobre claro */
  --color-text-secondary-strong: #5a6c80; /* descripciones sobre light-blue */
  --color-border-strong: #7a8fa3; /* bordes de inputs y controles (≥3:1) */

  /* Estados (no forman parte de la marca; tonos fríos coherentes) */
  --color-error: #b42335; /* verificar ≥4.5 sobre blanco al implementar */
  --color-success: #1f7a5a; /* idem */
}
```

### 1.2. Roles semánticos (lo que usan los componentes)

| Rol                                | Token                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------ |
| `bg-page`                          | surface / white (alternando secciones)                                                     |
| `bg-section-tint`                  | light-blue                                                                                 |
| `bg-inverse`                       | deep-blue (footer opcional, bloques puntuales; nunca grandes superficies oscuras seguidas) |
| `text-body` / `text-muted`         | text / text-secondary                                                                      |
| `text-accent`                      | primary-strong (pequeño) · primary (≥24 px)                                                |
| `border-subtle` / `border-control` | border / border-strong                                                                     |
| `focus-ring`                       | primary-strong 2 px + halo ice-blue 4 px                                                   |

### 1.3. Reglas

- Cian: acentos, trazos, puntos de presión, degradados, display enorme sobre deep-blue. **Nunca** texto sobre blanco ni único portador de información.
- Proporción orientativa por página: 70 % blancos/surface, 20 % light/ice, 10 % azules sólidos.
- Prohibidos: verde bosque, terracota, beige cálido; degradados saturados a pantalla completa.

### 1.4. Degradados

| Token               | Definición                                        | Uso                                                     |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| `--grad-atmosphere` | radial ice-blue 0.55 → transparente sobre surface | Fondos de hero                                          |
| `--grad-mist`       | lineal white → light-blue                         | Transiciones entre secciones                            |
| `--grad-brand`      | lineal primary → cyan (135°)                      | Líneas, halos, bordes, iconos; **no bajo texto blanco** |
| `--grad-glass`      | cyan 12 % → ice-blue 30 %                         | Superficies translúcidas                                |

### 1.5. Superficies translúcidas ("glass")

`background: color-mix(in oklab, white 62%, transparent)`, `backdrop-filter: blur(16px) saturate(1.2)`, borde 1 px `white/70 %`, sombra `--shadow-float`. Con `@supports not (backdrop-filter: blur())` → fondo blanco 92 %. Máximo 2-3 superficies glass simultáneas en viewport (rendimiento móvil).

## 2. Tipografía

- **Display:** Instrument Serif 400 + itálica (propuesta A) · alternativa B: DM Serif Display. Solo ≥ 28 px.
- **Sans:** Manrope variable (400, 500, 600, 700) · alternativa B: DM Sans.
- Palabra destacada en titulares: itálica display en `primary` (o `cyan` solo sobre deep-blue).
- Autoalojadas con `@nuxt/fonts`, `font-display: swap`, fallbacks métricos.

### Escala fluida (360 px → 1440 px)

| Token        | Mín → Máx                                   | Familia | Uso                           |
| ------------ | ------------------------------------------- | ------- | ----------------------------- |
| `display-xl` | 44 → 112 px, lh 0.95, tracking -0.02em      | Display | H1 Home                       |
| `display-l`  | 38 → 80 px, lh 1.0                          | Display | H1 páginas                    |
| `display-m`  | 32 → 56 px, lh 1.05                         | Display | H2 de sección                 |
| `heading-s`  | 22 → 28 px, lh 1.2, 600                     | Sans    | H3, títulos de tarjeta        |
| `body-l`     | 18 → 20 px, lh 1.6                          | Sans    | Intros                        |
| `body`       | 16 → 17 px, lh 1.65                         | Sans    | Texto                         |
| `small`      | 14 px, lh 1.5                               | Sans    | Metadatos                     |
| `eyebrow`    | 12 → 13 px, 600, uppercase, tracking 0.14em | Sans    | Etiquetas de sección, números |
| `numeral`    | 64 → 200 px                                 | Display | "9", números de fase          |

Implementación con `clamp()`; `text-wrap: balance` en titulares, `pretty` en párrafos. Medida máxima de párrafo: 62ch.

## 3. Espaciado, rejilla y breakpoints

- Escala base 4 px: `1 2 3 4 6 8 12 16 20 24 32 40` (×4 px).
- Espaciado de sección fluido: `--space-section: clamp(72px, 10vw, 160px)`.
- Contenedor: `max-width: 1320px`, gutter `clamp(16px, 4vw, 48px)`. Versión `wide` 1600 px para composiciones editoriales.
- Rejilla: 4 col (móvil) · 8 col (tablet) · 12 col (≥1024).

| Breakpoint        | Token Tailwind | Rango     |
| ----------------- | -------------- | --------- |
| móvil pequeño     | (base)         | ≤ 480     |
| móvil grande      | `sm` 481       | 481–767   |
| tablet            | `md` 768       | 768–1023  |
| escritorio        | `lg` 1024      | 1024–1439 |
| escritorio grande | `xl` 1440      | ≥ 1440    |

Además: `@media (hover: hover) and (pointer: fine)` como condición de todos los efectos hover; container queries en tarjetas.

## 4. Radios y sombras

| Token            | Valor                               | Uso                                           |
| ---------------- | ----------------------------------- | --------------------------------------------- |
| `radius-s`       | 10 px                               | Inputs, tags                                  |
| `radius-m`       | 18 px                               | Tarjetas                                      |
| `radius-l`       | 28 px                               | Contenedores de media, glass                  |
| `radius-pill`    | 999 px                              | Botones, chips                                |
| `radius-organic` | `42% 58% 63% 37% / 41% 44% 56% 59%` | Máscaras de imagen orgánicas (con moderación) |

Sombras frías (tinte deep-blue), nunca negras:

- `shadow-soft`: `0 1px 2px rgb(22 60 99 / .06), 0 8px 24px rgb(22 60 99 / .06)`
- `shadow-float`: `0 24px 60px -12px rgb(22 60 99 / .18)`
- `shadow-glow`: `0 0 0 1px rgb(0 169 208 / .25), 0 12px 40px -8px rgb(0 169 208 / .35)` (hover de CTA)

## 5. Botones

| Variante       | Reposo                                                          | Hover (pointer fino)                                         | Uso                              |
| -------------- | --------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------- |
| `primary`      | Fondo primary, texto blanco, pill, padding 14×24 (alto ≥ 48 px) | Fondo primary-strong, `shadow-glow`, flecha se desplaza 4 px | "Pedir cita" y CTA principal     |
| `secondary`    | Borde 1.5 px border-strong, texto deep-blue, fondo white/60 %   | Borde primary, fondo white                                   | "Descubrir servicios"            |
| `ghost` / link | Texto primary-strong + subrayado animado                        | Subrayado completo                                           | Enlaces dentro de texto/tarjetas |
| `on-dark`      | Fondo white, texto deep-blue                                    | Fondo ice-blue                                               | Sobre deep-blue                  |

- Estados: `focus-visible` (anillo §1.2), `active` (escala 0.98), `disabled` (opacidad 0.5 + `aria-disabled`), `loading` (spinner + texto "Enviando…", `aria-busy`).
- Icono opcional a la derecha (flecha/huella). Área táctil mínima 48×48.
- Implementado como `<NuxtLink>` o `<button>` según prop; nunca `<div>` clicable.

## 6. Formularios

- Label siempre visible (no solo placeholder), input alto 52 px, borde border-strong, radio `radius-s`, foco con anillo.
- Error: texto `error` + icono + `aria-describedby`; no solo color.
- Option cards (pedir cita): tarjetas seleccionables (`role="radio"` dentro de `radiogroup`, o input radio nativo estilizado), estado seleccionado con borde primary 2 px + check + fondo light-blue.

## 7. Lenguaje gráfico (biblioteca SVG propia)

Trazo 1.25–1.5 px (no escalable: `vector-effect: non-scaling-stroke`), color primary/cyan, opacidades 0.3–1, terminaciones redondeadas.

| Recurso                                           | Componente                | Notas                                          |
| ------------------------------------------------- | ------------------------- | ---------------------------------------------- |
| Huella izquierda/derecha                          | `FootprintTrail`          | Dibujada una vez; variante relleno y contorno. |
| Contorno de pie (lateral, plantar, dorsal)        | `FootOutline`             | Para ilustraciones de servicios.               |
| Líneas anatómicas / esquemas de huesos y tendones | `graphics/anatomy/*`      | Simplificadas, **revisadas por la podóloga**.  |
| Mapa de presión                                   | `PressureMap`             | Spec 04 §2.                                    |
| Curvas de movimiento / línea de recorrido         | `FlowPath`                | Animable con `stroke-dashoffset`.              |
| Puntos de presión / indicadores numéricos         | `PressurePoint`, `Metric` | Pulso CSS sutil.                               |
| Formas orgánicas                                  | `OrganicLines`            | Fondos de hero y separadores.                  |

No se usan sets de iconos genéricos para ilustrar servicios. Para iconos utilitarios (flecha, teléfono, cerrar, menú) se dibuja un set mínimo propio con el mismo trazo (≈12 iconos).

## 8. Movimiento (tokens comunes)

| Token                     | Valor                          |
| ------------------------- | ------------------------------ |
| `--dur-fast`              | 160 ms (hover, foco)           |
| `--dur-base`              | 320 ms (UI)                    |
| `--dur-reveal`            | 700 ms (entradas)              |
| `--ease-out`              | `cubic-bezier(.22, 1, .36, 1)` |
| `--ease-in-out`           | `cubic-bezier(.65, 0, .35, 1)` |
| Stagger                   | 60–90 ms                       |
| Desplazamiento de entrada | 24 px (móvil 16 px)            |

- **Entrada estándar (`reveal`)**: `y: 24 → 0`, `opacity: 0 → 1`, `dur-reveal`, una sola vez al entrar en viewport (umbral 15 %).
- **Hover**: escala máx. 1.03 en tarjetas, 1.05 en imágenes dentro de su máscara.
- **Scroll scrub**: solo en las 3 experiencias. Pins: ≤ 300 % de viewport en escritorio; **sin pin en < 768 px**.
- **Reduced motion**: sin desplazamientos ni scrub; fundidos ≤ 200 ms; secuencias muestran su estado final o pasos estáticos.

## 9. Entregable de la fase

Página `/_sistema` (excluida de producción y del sitemap) con: paleta + ratios de contraste, escala tipográfica, botones en todos los estados, inputs, option cards, glass, degradados, biblioteca SVG y demo de `reveal`.
