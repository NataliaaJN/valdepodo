# SPEC 05 — CONÓCENOS (`/conocenos`)

> Fase 6.4 del plan v2. Equipo + clínica + trayectoria + filosofía en una sola página. Datos en `app/data/team.ts`, `app/data/clinic.ts`.
> **Nunca** fotos de stock para el equipo o las instalaciones. Sin datos reales → placeholder ilustrado marcado.

## SEO

Title "Conócenos · Equipo y clínica · Valdepodo"; H1 del hero; schema `Person` (por profesional, solo con datos confirmados) vinculado a la organización.

## 1. Hero

- H1: "Detrás de cada paso, _hay personas_."
- Texto breve (`pending`): forma de entender la podología y compromiso.
- Visual: foto del equipo en la clínica (horizontal) en máscara de radio grande con líneas orgánicas superpuestas; o composición de los dos retratos solapados.
- Móvil: texto arriba, foto abajo a ancho completo.

## 2. Equipo (`#equipo`)

Dos tarjetas grandes (`TeamCard`), lado a lado en escritorio (cada una ~5 col de 12, desplazadas verticalmente 64 px para asimetría), apiladas en móvil.

Contenido por tarjeta (todo de `team.ts`, con `pending` donde falte):

- Fotografía (retrato vertical 4:5).
- Nombre y apellidos · Cargo · Breve descripción · Especialidades (tags) · Nº de colegiada (si la clínica quiere mostrarlo) · Redes profesionales (LinkedIn, solo si la persona lo autoriza).

### Comportamiento (inspiración Framify, sin copiar)

| Estado       | Escritorio (puntero fino)                                                                                                                                                                                                      | Táctil / móvil                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Reposo       | Foto a sangre; nombre + cargo sobre degradado inferior (deep-blue 0 → 70 %, garantiza contraste). Iconos de redes arriba a la derecha en chips glass.                                                                          | **Todo visible**: foto arriba, debajo nombre, cargo, descripción, especialidades y redes. |
| Hover / foco | Foto escala 1.04 y reencuadre leve (`object-position`), panel glass sube desde abajo con descripción + especialidades (opacidad 0→1, y 16→0, 320 ms), indicador "+" rota a "×".                                                | —                                                                                         |
| Teclado      | La tarjeta es enfocable si tiene contenido expandible; `Enter` alterna el panel; el contenido expandido está siempre en el DOM (no `display:none` para lectores de pantalla: se usa un patrón disclosure con `aria-expanded`). | —                                                                                         |

- Escritorio también ofrece el contenido sin hover: el panel puede abrirse con clic (botón "+" con `aria-label="Ver más sobre {nombre}"`).
- Cursor-etiqueta opcional "Ver" sobre la foto.

## 3. Clínica

- H2: "Un espacio pensado para _cuidar de ti_."
- `MediaMosaic`: 1 imagen principal grande (7 col) + 2 secundarias apiladas (5 col) + fila de 3-4 detalles pequeños con recorte orgánico/redondeado, desalineados verticalmente. Pies de foto breves.
- Lightbox accesible al pulsar (diálogo modal nativo `<dialog>`, navegación con flechas y teclado, `Esc`, foco atrapado, contador "2 / 7", gestos de deslizar en táctil).
- Móvil: principal a ancho completo + carrusel horizontal con scroll-snap para el resto (indicador "Arrastrar"/puntos).
- Imágenes vía `@nuxt/image` (AVIF/WebP, `sizes`, lazy salvo la principal si está en el primer viewport).

## 4. Experiencia

- H2: "9 años cuidando de la salud de _tus pies_." (número calculado desde `site.foundedYear`).
- Numeral "9" gigante (display, 200-320 px en escritorio, trazo outline con relleno que sube con el scroll — scrub corto, solo `full`).
- Texto de trayectoria (`pending`).
- Línea temporal **solo si hay hitos reales** (`clinic.milestones`); si la lista está vacía, no se renderiza.

## 5. Filosofía

- H2: "Escuchar. Analizar. Tratar. Prevenir."
- 4 conceptos conectados por una línea de recorrido (`FlowPath`, curva SVG). La línea se dibuja con scroll (scrub) y al alcanzar cada concepto este se activa (punto cian, título en primary, texto aparece).
- Escritorio: recorrido horizontal ondulado con conceptos alternando arriba/abajo. Tablet: 2×2 con línea en S. Móvil: vertical, línea a la izquierda.
- Reduced motion: línea completa y todos los conceptos activos.
- Textos de cada concepto: `pending`.

## 6. CTA

"Nos encantará _conocerte_." · Botón "Pedir cita".
