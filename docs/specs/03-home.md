# SPEC 03 — HOME (`/`)

> Fase 5 (propuesta visual: navbar + hero con pie + muestra de servicios) y Fase 6 (Home completa) del plan v2.
> Sin sección de equipo ni de instalaciones (viven en Conócenos).

## SEO

- `<title>`: "Valdepodo · Clínica de podología en {ciudad}" (`pending` ciudad).
- Meta description ≤ 155 caracteres con servicios principales y ciudad.
- H1 único: "Todo empieza por tus pies."
- Schema.org: `MedicalClinic` (o `Podiatrist` si se valida el tipo) con dirección, teléfono, horario, `sameAs` (Instagram, LinkedIn).

## 1. Hero

### Contenido

- Eyebrow: "Clínica de podología · {ciudad}".
- H1: "Todo empieza por tus _pies_." (itálica destacada).
- Descripción (provisional, **a validar**): una frase de propuesta de valor, p. ej. "Analizamos cómo está construido tu pie y cómo se mueve para cuidarlo en cada paso." → `pending()`.
- CTA primario "Pedir cita" → `/pedir-cita`. CTA secundario "Descubrir servicios" → `#servicios` (ancla a la sección siguiente).
- Controles de capa del modelo (ver abajo).

### Composición

| Breakpoint | Disposición                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| ≥ 1024     | 12 col: texto col 1-5, modelo col 5-12 (se solapa ligeramente con el texto en profundidad). Altura `100svh` (mín. 680 px).   |
| 768–1023   | Texto arriba (col 1-6 de 8), modelo debajo a la derecha, ocupa ~60 % del alto.                                               |
| < 768      | Texto arriba, modelo debajo a ancho completo (aspect 1/1, máx. 70svh), controles de capa en fila desplazable bajo el modelo. |

Fondo: surface + `--grad-atmosphere` (manchas ice-blue y cian difuminadas detrás del modelo) + `OrganicLines` finas que "orbitan" el pie + 2-3 elementos flotantes (puntos de presión, pequeño indicador numérico con una etiqueta anatómica). Sin grandes superficies oscuras.

### Modelo 3D (`FootAnatomy` dentro de `SceneGate`)

Capas: **Exterior · Músculos · Tendones · Huesos**.

- Controles: grupo de botones-toggle (`role="radiogroup"` o `aria-pressed`) con icono lineal + nombre. Una capa "activa" a la vez + el exterior como contexto translúcido (fresnel) cuando la activa es interna. Nunca todas opacas a la vez.
- Al seleccionar: transición 500 ms (opacidad/fresnel), la capa activa toma color de acento (primary/cyan), aparece una **etiqueta** (`AnatomyLabel`) anclada a 1-3 estructuras clave de esa capa con nombre y una línea de descripción **validada**.
- Puntos de interés (hotspots): pequeños puntos pulsantes clicables/enfocables sobre estructuras curadas; abren su etiqueta. Accesibles por teclado (lista equivalente en el DOM).
- Rotación: arrastre horizontal (escritorio y táctil), límites ±60° en Y y ±15° en X, retorno suave al soltar (escritorio). Rotación ociosa muy lenta (desactivada con reduced motion). Sin zoom con rueda (no capturar el scroll).
- Hover (puntero fino): resalta la estructura bajo el cursor (outline/emisivo) + cursor-etiqueta "Explorar".
- Táctil: `touch-action: pan-y` en el canvas → el scroll vertical nunca se bloquea; tap en hotspot = seleccionar.

### Secuencia de scroll (solo `full`, ≥ 1024 px)

Sección pineada ~250 % de viewport con scrub (`scrub: 0.6`):

| Tramo | Progreso | Estado                                                                                                                      |
| ----- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| 0     | 0        | Pie completo (exterior), vista 3/4.                                                                                         |
| 1     | 0–0.25   | Rotación del modelo hacia vista medial.                                                                                     |
| 2     | 0.25–0.5 | Transición a anatomía interna: el exterior pasa a fresnel translúcido, aparecen músculos/tendones.                          |
| 3     | 0.5–0.8  | Estructuras destacadas (huesos + 2-3 etiquetas validadas que aparecen y se van). Texto lateral cambia en 2-3 frases cortas. |
| 4     | 0.8–1    | El modelo se desplaza/escala hacia un lateral y se desvanece; entra el titular de Servicios.                                |

- Tablet / `lite`: sin pin; animación corta de rotación + transición a huesos al entrar en viewport (scrub corto sobre la propia sección).
- Móvil: sin pin, sin scrub largo; el modelo responde a los controles; una única rotación suave al aparecer.
- Reduced motion / `static`: póster + controles que cambian entre 4 pósters por capa (pre-renderizados), etiquetas como lista.
- Si la interacción manual ocurre durante la secuencia, el scroll tiene prioridad sobre la rotación (se interpola desde la rotación del usuario).

**Capas disponibles:** los botones se generan a partir de los grupos presentes en el GLB (spec 08 §2.1). Si la fuente no tiene, por ejemplo, ligamentos o piel, esa capa no aparece. Nunca se simula.

**Si el modelo no está aprobado (Gate 2 pendiente):** se integra el prototipo marcado con `PendingBadge` en preview y la arquitectura completa (estados, controles, secuencia). No se simula con una imagen estática en escritorio.

## 2. Servicios (`#servicios`)

- H2: "Cuidamos de tus pies en _cada paso_."
- 5 servicios desde `app/data/services.ts`; 3 destacados (Estudio biomecánico, Plantillas personalizadas, Podología general).

### Composición asimétrica (≥ 1024)

```
┌─────────────────────────┬──────────────┐
│ 01 Estudio biomecánico  │ 02 Plantillas│
│ (grande, mapa presión)  │ (alta, capas)│
├──────────────┬──────────┴──────────────┤
│ 03 Pod.      │ 04 Infantil · 05 Pie    │
│ general      │ diabético (filas        │
│ (media)      │ editoriales compactas)  │
└──────────────┴─────────────────────────┘
```

- Cada destacado: número, nombre, frase, recurso gráfico específico (mini mapa de presión, plantilla en capas SVG, ilustración de uña/piel), enlace "Ver servicio".
- Los otros dos: filas con número + nombre + frase + flecha.
- Hover (puntero fino): tarjeta escala 1.02, el recurso gráfico se mueve (p. ej. capas de plantilla se separan 6 px, focos del mapa cambian), aparece indicador "Ver servicio →", borde pasa a primary 40 %.
- Tablet: 2 columnas (destacados 1 y 2 lado a lado, 3 a ancho completo, filas debajo).
- Móvil: lista vertical; destacados con recurso gráfico visible y animado al entrar en viewport (no por hover); toda la tarjeta es el enlace (un único `<a>` por tarjeta).

## 3. Valores

Cuatro bloques **horizontales** (no tarjetas grandes): icono lineal propio + título + texto, separados por líneas verticales finas `border`.

| Valor                     | Texto (provisional hasta validar)                          |
| ------------------------- | ---------------------------------------------------------- |
| 9 años de experiencia     | Trayectoria y compromiso con la salud de los pies.         |
| Trato cercano             | Atención personalizada y escucha activa.                   |
| Tecnología y calidad      | Medios y materiales adecuados para la atención podológica. |
| Ubicación y accesibilidad | Facilidad de acceso y atención adaptada a los pacientes.   |

- "9" calculado desde el año de apertura (`pending`).
- Fondo white o light-blue. Escritorio 4 col · tablet 2×2 (separadores horizontales y verticales) · móvil 1 col (≤ 480) o 2 col (481–767).
- Animación: entrada `reveal` con stagger; la línea separadora se "dibuja".

## 4. Reseñas

- H2: "La confianza se construye _paso a paso_."
- Datos: `app/data/reviews.ts` (solo reseñas reales con permiso/procedencia). **Si la lista está vacía, la sección no se renderiza.**
- Formato propuesto: composición editorial — una reseña destacada grande (display-m entre comillas) + 2-4 secundarias en columna; o carrusel accesible si hay > 5.
- Cada reseña: texto, valoración (si existe; estrellas como SVG + texto "5 de 5"), nombre o iniciales, fuente ("Reseña de Google") con enlace al perfil.
- Carrusel (si aplica): botones anterior/siguiente, `aria-roledescription="carrusel"`, sin autoplay (o autoplay pausado en hover/foco y desactivado con reduced motion), arrastre en táctil.

## 5. CTA final

- H2: "Da el próximo _paso_." + texto breve (`pending`) + botón "Pedir cita".
- `FootprintTrail`: 6-8 huellas alternas que aparecen progresivamente (stagger 120 ms) al entrar en viewport, recorriendo una curva hacia el botón. Reduced motion: huellas visibles estáticas.
- Fondo: light-blue con `--grad-mist`; en móvil la trayectoria se vuelve vertical.

## 6. Orden de carga

1. SSR: texto del hero + póster del modelo (LCP candidato = H1).
2. Tras `requestIdleCallback` (o al interactuar), si `tier !== 'static'`: carga de chunk TresJS + GLB.
3. ScrollTriggers de la Home se crean cuando el modelo está listo (o con el póster en modo `static`).
