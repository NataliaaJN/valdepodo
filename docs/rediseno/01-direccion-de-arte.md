# Rediseño global — Dirección de arte y sistema visual

> Rama `feature/rediseno-global`. Sustituye al lenguaje visual de la Fase 5/6 (serif + celeste + tarjetas redondeadas).
> Prioridad: **identidad > diferenciación > experiencia > estética > decoración.**

## 1. Diagnóstico: por qué la web actual parece una plantilla

| Síntoma                                                                         | Dónde                       | Por qué es «plantilla de clínica»                                             |
| ------------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| Texto a la izquierda + objeto a la derecha, dos botones pill                    | Hero                        | La composición por defecto de cualquier landing                               |
| Todo es azul pastel sobre blanco azulado, con «atmósferas» radiales             | Todas                       | Es el cliché cromático sanitario; no hay contraste ni ritmo de color          |
| Serif + palabra en cursiva azul en cada titular («Todo empieza por tus _pies_») | Todas                       | Fórmula repetida 12 veces: eyebrow + serif + acento. Es «bienestar», no marca |
| Blobs, órbitas, chips flotantes, glass en la navbar y los chips                 | Hero, CTA, cards            | Decoración que sustituye a la composición                                     |
| Tarjetas de 28 px con borde, sombra y degradado                                 | Servicios, contacto, equipo | Lenguaje de dashboard/SaaS                                                    |
| Servicios = gráficos SVG genéricos + resumen + «Ver servicio»                   | Home y /servicios           | Sin fotografía, sin tensión; cada tarjeta explica en vez de invitar           |
| Footer de 4 columnas sobre azul con huellas                                     | Global                      | Footer corporativo estándar                                                   |
| Cada página: breadcrumbs + eyebrow + H1 + atmósfera                             | Todas                       | Mismo molde repetido: ninguna página sorprende                                |
| Tipografía: Instrument Serif + Manrope                                          | Todas                       | Combinación muy vista (serif de moda + sans geométrica); sin voz propia       |

Lo que **sí** vale y se conserva: el pie 3D por capas (es el activo diferencial), el logotipo, el azul `#1270B6` / cian `#1EABE1`,
la arquitectura Nuxt, las páginas con sus experiencias (secuencia biomecánica, plantilla en fibras), la accesibilidad y el rendimiento.

## 2. Idea de marca: «Paso a paso»

Valdepodo no vende un tratamiento: acompaña un **paso**. La web se recorre como se camina: cada scroll es un paso, la escala
crece como crece una pisada, y el pie —el 3D— es el protagonista físico. De ahí:

- **Escala monumental** de tipografía (el claim ocupa la pantalla; VALDEPODO cierra la página a ancho completo).
- **Capítulos de color a sangre** (azul → hueso → tinta → hueso → azul → tinta) en lugar de una sola superficie celeste.
- **Fotografía tratada** como en una revista: monocroma azul en reposo, color real al acercarte.
- **Un solo gesto de movimiento**: desplazamientos lentos, con inercia, nunca «efectos».

Tono: contemporáneo + humano + premium. Cercano porque hay calidez (papel hueso, trazo tipográfico con carácter), no porque
haya sonrisas de stock.

## 3. Tipografía

### 3.1 Comparativa (render real de «Da el próximo paso.» con acentos y cifras)

| Familia (OFL, uso comercial libre)              | Veredicto                                                                                                                                                      |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Manrope, Plus Jakarta Sans, Sora                | Geométricas correctas pero genéricas: es lo que lleva cualquier SaaS/clínica. Descartadas.                                                                     |
| Geist, Instrument Sans                          | Neutras y muy legibles, sin rasgo. **Instrument Sans** se conserva solo como texto corrido.                                                                    |
| Space Grotesk                                   | Rasgos fuertes (D, a, y) pero suena a «cripto/tech». Contradice «humano».                                                                                      |
| Funnel Display                                  | Rasgos propios pero fríos y de ancho único.                                                                                                                    |
| Fraunces / serifs                               | Calidez, pero es exactamente el cliché «bienestar premium» del que huimos.                                                                                     |
| **Bricolage Grotesque** (ejes opsz, wdth, wght) | Grotesca con rasgos de tinta (a, e, x, ó), contraste vivo, versión condensada para monumentales y óptica propia por tamaño. Humana y reconocible. **Elegida.** |

### 3.2 Sistema

- **Display — Bricolage Grotesque** (variable): 600–700, `wdth` 75–100, tracking −0.035 em, interlineado 0.86–1.0.
  Claim y titulares en versión condensada; no tiene cursiva, así que **se elimina la fórmula «palabra en cursiva azul»**:
  el énfasis se hace con color, cambio de ancho o contorno.
- **Texto — Instrument Sans** 400/500: 16–17 px, interlineado 1.6, medida ≤ 62ch. Máxima legibilidad.
- **Etiquetas**: Instrument Sans 500, mayúsculas, 0.08 em, con índices entre paréntesis `(01)`.
- Escala fluida: `mega` 72→240 px · `display-xl` 52→128 · `display-l` 40→88 · `display-m` 32→60 · `heading` 22→30 · `body-l` 18→21 · `body` 16→17 · `small` 14 · `label` 12–13.

## 4. Color

| Rol                | Token                       | Valor     | Uso                                                                    |
| ------------------ | --------------------------- | --------- | ---------------------------------------------------------------------- |
| **Azul Valdepodo** | `--color-primary`           | `#1270B6` | Color dominante de los capítulos «de marca» (hero, cierre) y acentos   |
| **Tinta**          | `--color-deep-blue` / `ink` | `#061A2C` | Texto, capítulo oscuro (servicios, footer). Sustituye al azul profundo |
| **Hueso**          | `--color-surface`           | `#F1EFE9` | Papel base. Cálido: humaniza el azul y rompe el blanco clínico         |
| Hueso 2            | `--color-light-blue`        | `#E7E4DC` | Segundo plano de papel (alternar secciones)                            |
| Cian               | `--color-cyan`              | `#1EABE1` | Único acento vivo: estados activos, hover del título, puntos del 3D    |
| Azul claro         | `--color-ice-blue`          | `#BFD8EA` | Texto de apoyo sobre azul/tinta, selección                             |
| Azul fuerte        | `--color-primary-strong`    | `#0B5E99` | Enlaces y texto azul pequeño sobre hueso (6.1:1)                       |

Reglas: el azul **no es el fondo de los botones**; es un _capítulo_ (color de campo). Los botones son tinta/hueso. Cian nunca
como texto sobre claro (contraste 2.4:1). Sin degradados decorativos: solo un velo (scrim) bajo el texto sobre fotografía.
Los nombres de token se conservan (`primary`, `deep-blue`, `surface`…) para que las 60 piezas existentes (SVG, 3D, formularios)
adopten la paleta nueva sin reescribirse.

## 5. Forma y superficies

- **Radio único 8 px** (`--radius-s/m/l` = 6/8/8). El píldora queda solo para puntos y chips mínimos. Sin radios de 28 px.
- **Líneas finas** 1 px (`tinta` al 14 % sobre hueso, `hueso` al 20 % sobre tinta) para estructurar, en lugar de cajas.
- **Sin sombras**. La profundidad viene de capas (imagen, escala, solape), no de blur.
- **Glassmorphism**: solo en las micro-tarjetas de datos (pausa bajo el hero) y en la navbar al hacer scroll. Nada más.
- **Botón**: rectángulo de 8 px, tinta sobre hueso / hueso sobre azul; flecha en cuadro propio; al pasar el cursor el texto
  «rueda» (se desliza y entra la copia) y la flecha rellena. Alto ≥ 48 px.

## 6. Fotografía

Tratamiento común, **independiente de la foto de origen** (permite sustituir los placeholders sin tocar componentes):

1. Reposo: escala de grises 85 % + capa azul de marca en `multiply` (monocromo azul), contraste 1.05.
2. Hover / activo (móvil): el color vuelve (saturación a 1, capa azul al 0), zoom lento 1.00 → 1.07 en 1.4 s.
3. Velo inferior de tinta (scrim) solo detrás del texto, para garantizar contraste AA.
4. Proporciones editoriales (7:5, 4:5, 1:1), radio 8 px.

Las URL provisionales de Unsplash viven en **un único archivo** (`app/data/service-media.ts`); sustituirlas por las definitivas
es cambiar `src` (y opcionalmente el punto focal).

## 7. Lenguaje de movimiento

| Aspecto        | Regla                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------- |
| Easing         | `--ease-out-expo` `cubic-bezier(.16,1,.3,1)` para entradas y zoom; `--ease-in-out-quart` `(.76,0,.24,1)` para cierres |
| Duraciones     | Micro 180 ms · hover 450 ms · imagen 1 400 ms · entradas 900 ms · capítulos 1 200 ms                                  |
| Entrada        | Titulares por **líneas** (máscara, `translateY 105% → 0`), texto con fundido corto; una vez                           |
| Scroll         | Un solo ritmo: hero fijado (escritorio) con el pie avanzando de capa; cifra y claim que crecen con el scroll          |
| Parallax       | Solo en imagen (±14 px) y siguiendo el puntero; jamás en texto                                                        |
| Cursor         | Botón del cierre magnético (≤ 12 px); sin cursor personalizado global                                                 |
| Táctil         | Sin hover: el elemento centrado en pantalla se «activa» (misma animación que el hover)                                |
| Reduced motion | Todo estático y completo; sin fijado ni parallax                                                                      |

## 8. El 3D en la experiencia

El pie deja de ser «imagen a la derecha»: es **el elemento que pisa el claim**.

- Hero a sangre en azul Valdepodo. «Da el próximo paso.» en tres líneas escalonadas, enormes; el pie queda _delante_ de las
  letras (el canvas es transparente) y solapa «próximo» → profundidad real.
- Escritorio (≥ 1024 px, nivel `full`): hero fijado; el scroll recorre piel → músculos → huesos mientras el pie gira y avanza
  hacia la izquierda («da el paso») y, al final, sale hacia abajo dejando paso a los datos.
- Tablet/móvil: sin fijado; el pie asoma por debajo del claim y se maneja con arrastre y selector de capa.
- Un único `<canvas>` por página (regla de la spec 08). El cierre de la web reutiliza el **póster** del pie (imagen estática)
  recortado y a gran escala, no un segundo WebGL.

## 9. Aplicación por tipo de página

Piezas compartidas (todas las páginas): `SiteNavbar` (cambia de tema según el capítulo bajo ella), `PageHeader` (índice +
titular monumental + lede en columna desplazada), `ServiceTile`, `CtaBlock` (= cierre «Da el próximo paso.»), `SiteFooter`.

| Página              | Composición                                                                                                                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home                | Hero azul + 3D · pausa de datos · servicios (tinta) · «Todo empieza por tus pies» + método · cierre azul · footer                                                                        |
| Servicios           | `PageHeader` + los mismos 5 tiles en grande + lista editorial (descripción y «Te ayuda si…») en filas con filetes                                                                        |
| Servicio individual | Cabecera a sangre con la foto del servicio y el título monumental solapado · ficha lateral (número, necesidades, CTA) · experiencia propia (SVG/3D) sobre hueso · relacionados con tiles |
| Conócenos           | `PageHeader` cálido + mosaico de fotos sin marco + equipo en columnas desplazadas + cifra enorme de años + cuatro verbos tipográficos                                                    |
| Contacto            | Datos como lista tipográfica de filetes (sin cajas) + mapa; mínimo adorno, máxima claridad                                                                                               |
| Pedir cita          | Formulario sobre hueso, columna única, campos de 8 px; barra de progreso lineal. Usabilidad > efecto                                                                                     |
| Legales             | `PageHeader` sobrio + prosa en hueso                                                                                                                                                     |

## 10. Composición de la Home (ritmo)

1. **Hero** (azul, 100 svh, fijado): claim monumental + pie 3D + una sola acción + selector de capa.
2. **Pausa de datos** (hueso, mucho aire): micro-tarjetas glass con `9 años`, trato cercano, tecnología, ubicación.
3. **Servicios** (tinta): cabecera mínima + composición asimétrica 2 + 3 (7/5 y tercios con desfase). Sin descripciones.
4. **Manifiesto + método** (hueso): «Todo empieza por tus pies.» y los cuatro verbos (Escuchar · Analizar · Tratar · Prevenir) como lista tipográfica.
5. **Reseñas** (solo si hay reales).
6. **Cierre** (azul): «Da el próximo paso.» con escala creciente por línea, pie en póster y botón magnético.
7. **Footer** (tinta): una fila de datos + VALDEPODO a ancho completo recortado.

## 11. Lista de comprobación final (se revisa al terminar)

¿Parece plantilla? · ¿La tipografía tiene voz? · ¿La primera impresión es memorable? · ¿El 3D está integrado? · ¿La fotografía es
coherente? · ¿Demasiado glass? · ¿Demasiadas tarjetas? · ¿Hay aire? · ¿Cada animación aporta algo? · ¿Todas las páginas son la misma marca?
Resultado documentado en `02-revision-final.md`.
