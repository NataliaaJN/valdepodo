# SPEC 04 — SERVICIOS (índice + 5 páginas)

> Fases 3-4 (laboratorio de experiencias), 5 (integración) y 6 (páginas) del plan v2. Datos en `app/data/services.ts` (slug, nombre, resumen, necesidades, SEO, recurso gráfico). **Todo texto clínico es `pending()` hasta validación de la clínica.**
> Todas las páginas: un H1, `useSeoMeta`, schema `MedicalProcedure`/`Service` + `BreadcrumbList`, enlace a otros servicios ("También te puede interesar") y CTA final.

## 0. Índice — `/servicios`

- H1: "Soluciones para cuidar de tus _pies_."
- 5 bloques editoriales, **no una rejilla de 5 tarjetas iguales**: alternancia de tamaños y posiciones (imagen izquierda / derecha, uno a sangre, uno compacto), cada uno con número, nombre, descripción, recurso gráfico propio, lista "Te ayuda si…" (necesidades, 2-4 ítems) y enlace.
- Recursos por servicio: mapa de presión (biomecánico), plantilla en capas (plantillas), ilustración de uña/piel (general), huellas pequeñas creciendo (infantil), contorno con puntos de control (diabético).
- Móvil: lista vertical, recurso arriba, texto debajo, todo visible.
- Animación: `reveal` + leve parallax del recurso (≤ 40 px, solo ≥ 1024).
- CTA final: "¿No sabes qué necesita tu pie?" + "Pedir cita".

---

## 1. Estudio biomecánico — `/servicios/estudio-biomecanico`

Concepto: "Cada paso cuenta."

### 1.1. Hero

- Visual: huella plantar con **mapa de presión ilustrativo** (`PressureMap`) que "respira" (focos que se desplazan suavemente), rampa deep-blue → primary → cyan → ice-blue/blanco.
- H1 + descripción (`pending`) + CTA "Solicitar estudio" → `/pedir-cita?motivo=estudio-biomecanico`.
- Leyenda pequeña: "Visualización ilustrativa".
- Layout: escritorio split 50/50 (huella a la derecha, vertical); móvil huella debajo, más pequeña.

### 1.2. Introducción

Qué es y qué permite analizar (`pending`). Composición: texto a 2 columnas + 3 indicadores con iconos lineales (p. ej. "Estático", "Marcha", "Carrera").

### 1.3. Secuencia de huellas (`BiomechSequence`) — experiencia destacada nº 2

Fases (texto **a validar**; no afirmar que todos los estudios incluyen todas):

| #   | Fase                          | Visualización                                                                                                                                                               |
| --- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01  | Análisis articular y muscular | Contorno lateral del pie con ejes articulares y arcos de movilidad (SVG).                                                                                                   |
| 02  | Análisis plantar estático     | Huella + mapa de presión estático (dos pies).                                                                                                                               |
| 03  | Análisis de la marcha         | Secuencia de huellas alternas + línea de centro de presiones.                                                                                                               |
| 04  | Análisis de carrera           | Huellas más espaciadas, focos de antepié más intensos, líneas de velocidad.                                                                                                 |
| 05  | Valoración de resultados      | Comparativa izquierda/derecha con indicadores numéricos **ilustrativos** (sin cifras clínicas falsas: barras/porcentajes sin unidades o claramente rotulados como ejemplo). |
| 06  | Propuesta de tratamiento      | La huella se "rellena" con la silueta de una plantilla → enlace a Plantillas.                                                                                               |

**Escritorio (≥ 1024, tier `full`/`lite`):**

- Layout 2 columnas: izquierda visual sticky (`position: sticky` + ScrollTrigger para el progreso; pin solo de la columna visual), derecha 6 bloques de texto (uno por fase, ~70 svh cada uno).
- Al avanzar: una huella nueva aparece por fase sobre una trayectoria (la huella activa en primary/cyan, las anteriores en ice-blue), el visual cambia de estado (cross-fade 400 ms + morph de focos del mapa), indicador de progreso lateral "01 — 06".
- Cada bloque de texto: número (numeral), título (heading-s), explicación, ilustración pequeña específica.

**Tablet:** mismo esquema con visual más pequeño, transiciones simplificadas (sin morph, solo cross-fade).

**Móvil:** **sin sticky**. 6 tarjetas verticales, cada una con su visual propio arriba (huella pequeña + estado del mapa), animación `reveal` + el mapa de presión se "enciende" al entrar en viewport. Una línea de recorrido vertical conecta las tarjetas.

**Reduced motion:** visual estático por fase (sin morph), cambio instantáneo de estado.

**Accesibilidad:** las 6 fases son un `<ol>` en el DOM; los visuales son `aria-hidden` con texto alternativo en el propio contenido.

### 1.4. Implementación de `PressureMap`

- SVG: silueta de huella como `clipPath`; 4-7 `<circle>` con `radialGradient` (stops con la rampa) + `filter: feGaussianBlur` sobre el grupo; estados definidos como arrays de focos `{x, y, r, intensity}` en datos (`app/data/biomech.ts`).
- GSAP interpola los focos entre estados.
- Mejora opcional `full`: `PressureShader.client` (plano TresJS con shader de fragmentos que suma gaussianas + ruido) usando los mismos datos. **Solo si aporta valor visual real** frente al SVG (se decide en el laboratorio, Fase 3); Three.js no debe ser una dependencia de esta página.

### 1.5. CTA

"Cada paso empieza por entender _cómo pisas_." · Botón "Solicitar estudio biomecánico".

---

## 2. Plantillas personalizadas — `/servicios/plantillas-personalizadas`

Concepto: "No existen dos pies iguales. Tus plantillas tampoco deberían serlo."

### 2.1. Hero

- `InsoleLayers` (modelo procedural, spec 08) en vista 3/4 flotando, con rotación lenta; fondo luminoso (atmósfera + líneas que siguen el contorno de la plantilla).
- H1 + descripción (`pending`) + CTA "Pedir cita" (`?motivo=plantillas-personalizadas`).
- Móvil: modelo debajo del texto, sin rotación continua (solo al entrar).

### 2.2. Plantilla descompuesta — experiencia destacada nº 3 (parte A)

- **Representación conceptual** (decisión v2): capas generadas con `tools/blender/config/insole.json`, con etiquetas genéricas desde `app/data/insole.ts` ("Capa superior", "Capa intermedia", "Base"). **No se nombran materiales, durezas, propiedades biomecánicas ni procesos de fabricación** salvo que la clínica los confirme. Un rótulo discreto indica "Representación conceptual".
- Escritorio: sección pineada ~200 % viewport, scrub.
  - 0: plantilla completa.
  - 0.1–0.6: las capas se separan progresivamente en vertical (explosión), con leve rotación de cámara (≤ 15°).
  - 0.3–0.9: aparece una etiqueta por capa (línea guía + número + nombre + función + espesor si se confirma), alternando lados.
  - 0.9–1: las capas quedan suspendidas; sale el pin.
- Tablet: sin pin; explosión al entrar en viewport con scrub corto; etiquetas debajo como lista numerada.
- Móvil: modelo explotado en estado final fijo (sin scrub) o pósters; etiquetas como lista numerada vinculada por número.
- `static`: póster explotado + lista.
- Accesibilidad: la lista de capas existe en el DOM (`<ol>`), el 3D es `aria-hidden`.

### 2.3. Construcción mediante fibras — experiencia destacada nº 3 (parte B)

- `FiberField` (spec 08 §4): fibras dispersas → agrupación → superficie → volumen → plantilla.
- Texto en 5 pasos cortos sincronizados, presentado como **visualización conceptual del material** (texto validado por la clínica; si el proceso real no usa fibras, se adapta la metáfora o se elimina la sección).
- Escritorio: pin ~150 %; tablet: sin pin, scrub en sección; móvil: animación autónoma corta (3 s) al entrar en viewport con nº reducido de fibras, o póster.
- Reduced motion: imagen final + 5 pasos como lista.

### 2.4. Proceso de personalización

`StepList` horizontal (escritorio) / vertical (móvil): 01 Valoración del pie · 02 Análisis de necesidades · 03 Diseño y adaptación · 04 Entrega y seguimiento (**a validar**). Línea de recorrido que se dibuja con el scroll; enlace al Estudio biomecánico en el paso 01.

### 2.5. CTA

"El soporte adecuado empieza con un _buen análisis_."

---

## 3. Podología general — `/servicios/podologia-general`

- H1: "Cuidar tus pies también es _prevenir_."
- Intro breve (`pending`).
- 4 tratamientos en **filas editoriales** (`TreatmentRow`), divididas por líneas finas:

| #   | Tratamiento            | Subtítulo (de notas iniciales, a validar) |
| --- | ---------------------- | ----------------------------------------- |
| 01  | Uñas encarnadas        | Tratamiento y prevención                  |
| 02  | Papilomas y verrugas   | Eliminación segura                        |
| 03  | Durezas y callosidades | Eliminación y cuidado                     |
| 04  | Ojo de gallo           | `pending`                                 |

- Fila (≥ 1024): número grande (numeral, outline) · nombre (display-m) · descripción · ilustración (oculta y revelada en hover) · enlace "Pedir cita" (`?motivo=podologia-general`).
- Hover (puntero fino): fondo light-blue, el número se desplaza 12 px a la derecha, la ilustración aparece/escala desde 0.9 en una máscara orgánica siguiendo ligeramente al cursor (≤ 20 px), flecha indicadora.
- Táctil / < 1024: cada fila muestra ilustración, descripción y enlace siempre visibles (no hay acordeón que oculte información).
- Ilustraciones: lineales propias (no fotografías clínicas explícitas en hover). Si se usan fotos de tratamiento, con consentimiento.
- CTA: "No dejes que las molestias condicionen _tus pasos_."

---

## 4. Podología infantil — `/servicios/podologia-infantil`

Concepto: "Los pies también _crecen_." Estética amable: más aire, formas orgánicas redondeadas, huellas pequeñas, ice-blue más presente; **sin** tipografías ni colores "infantiles".

| #   | Sección                            | Recurso                                                                                    |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | Hero                               | Huellas de tamaño creciente (infancia → adulto) que aparecen en secuencia.                 |
| 2   | Introducción al desarrollo del pie | Texto + ilustración de contorno.                                                           |
| 3   | Qué podemos valorar                | Lista con iconos lineales (2 col escritorio, 1 móvil).                                     |
| 4   | Desarrollo del pie                 | Línea temporal horizontal por edades (`pending`, solo hitos validados); vertical en móvil. |
| 5   | Forma de caminar                   | Ilustración de huellas de marcha con línea de progresión.                                  |
| 6   | Alteraciones de la marcha          | Lista editorial (sin lenguaje alarmista, sin diagnósticos).                                |
| 7   | Seguimiento y prevención           | `StepList` + consejo de revisión (validado).                                               |
| 8   | CTA                                | "Pedir cita" (`?motivo=podologia-infantil`).                                               |

Animaciones: solo `reveal` y la aparición de huellas. Sin experiencias pineadas.

---

## 5. Pie diabético — `/servicios/pie-diabetico`

- H1: "Cuidar tus pies es cuidar tu _salud_." Estética sobria: más white, menos degradados, ilustraciones mínimas, sin elementos flotantes decorativos.
- Secciones: 1. Importancia de la prevención · 2. Cuidados y atención podológica · 3. Señales que requieren valoración · 4. Recomendaciones generales · 5. CTA.
- Sección 3: lista clara con iconos (no solo color), y aviso destacado: "Ante una herida que no cicatriza o signos de infección, acude a tu médico o servicio de urgencias" (**texto a validar por la clínica**).
- Sección 4: recomendaciones con descargo "Estas recomendaciones son generales y no sustituyen una valoración profesional individual".
- Animación: solo `reveal` con desplazamiento reducido (12 px).
- CTA: "Pedir cita" (`?motivo=pie-diabetico`).

---

## 6. Parámetro `?motivo=` (todas las páginas de servicio)

Los CTA de servicio enlazan a `/pedir-cita?motivo=<slug>`; el wizard preselecciona el motivo (spec 06) sin saltar el paso (el usuario lo ve y puede cambiarlo).
