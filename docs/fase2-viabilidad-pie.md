# FASE 2 — VIABILIDAD DEL PIE ANATÓMICO 3D

> Informe del prototipo (10/11/2026). Relacionado: [01-research.md §5.A](01-research.md) · [3d-pipeline.md](3d-pipeline.md) · [specs/08](specs/08-experiencias-3d.md)
> Estado: **prototipo funcional, pendiente de la revisión anatómica de la podóloga (Gate 2).** Nada de este modelo se usa todavía fuera de `/_lab`.

## 1. Resumen

- **El pie anatómico es viable con BodyParts3D 4.0 (CC BY 4.0)** para cuatro capas: **exterior, huesos, músculos y tendón de Aquiles**. Las estructuras proceden de la fuente tal cual: solo se seleccionan, se limpian (unión de vértices duplicados), se recortan por encima del tobillo y se reorientan.
- **Tendones:** en la fuente, los tendones distales forman parte de la misma malla que su músculo (tibial anterior, tibial posterior, flexores, extensores, peroneos). La única malla de tendón independiente es el **tendón calcáneo (Aquiles)**. Separarlos exigiría cortar mallas por criterio propio, algo que no hacemos sin validación.
- **Ligamentos:** BodyParts3D solo tiene el **ligamento plantar largo**. Z-Anatomy añade ~50 ligamentos del tobillo y del pie, más la **aponeurosis plantar** y los retináculos, pero son **esquemáticos** (tiras de 2-40 polígonos modeladas a mano) y con licencia **CC BY-SA 4.0**.
- **Peso y rendimiento:** 73.376 triángulos, **563 KB** (variante completa) y **484 KB** (`lite`), muy por debajo del presupuesto (2,5 MB / 1 MB). Pendiente: reducir draw calls de 62 a ≤ 40 fusionando las estructuras no destacadas.
- **Estética:** el estilo de marca (piel fresnel translúcida, músculos azul `#1270B6`, tendones cian `#1EABE1`) ya funciona en `/_lab/pie`.

## 2. Fuentes inspeccionadas

| Fuente                                                             | Versión / fecha                                           | Licencia verificada                                                                       | SHA-256 del paquete |
| ------------------------------------------------------------------ | --------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------- |
| BodyParts3D `isa_BP3D_4.0_obj_99.zip` (2.234 mallas OBJ)           | Release 4.0 (2013/06/19); licencia actualizada 2025/02/27 | **CC BY 4.0** — README actual: libre uso, redistribución y obras derivadas con atribución | `40665852…cd409e`   |
| Z-Anatomy `Z-Anatomy.zip` (`Startup.blend`, 307 MB, 7.184 objetos) | commit `1905c88` (09/11/2026); `.blend` de mayo 2023      | **CC BY-SA 4.0** (License.txt del repo)                                                   | `e0296885…d9da736`  |

Ambos paquetes están en `tools/sources/` (excluido de git). El `.blend` de Z-Anatomy se abrió con `--disable-autoexec`: sus scripts embebidos no se ejecutaron.

## 3. Método

1. **Inventario espacial** (`npm run 3d:inspect`): región del pie derecho calculada a partir de huesos ancla (calcáneo, astrágalo, navicular, 1.er y 5.º metatarsianos, falanges distales) más un margen de 25 mm y 110 mm por encima del tobillo. Se recorren **todas** las mallas de la fuente y se seleccionan las que tienen vértices dentro de esa región, sin filtrar previamente por nombre, así que no se pierde ninguna estructura.
2. **Clasificación** por capa según el nombre FMA (con reglas ordenadas en `tools/blender/config/foot.json`).
3. **Calidad de malla** y **renders de validación** (`npm run 3d:foot-validation`).
4. **Prototipo GLB** (`extract_foot.py` → `optimize.mjs`) y **estilizado** en `/_lab/pie`.
5. Inventario de **Z-Anatomy** por nombres (`npm run 3d:inspect-za`), con triángulos evaluados (modificadores aplicados).

## 4. Resultados — BodyParts3D (pie derecho)

| Capa              | Estructuras                                                                                 | Triángulos (recortado) | Aristas abiertas tras limpieza | Valoración                                                           |
| ----------------- | ------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------ | -------------------------------------------------------------------- |
| Exterior (piel)   | 1 (piel de cuerpo entero recortada)                                                         | 16.320                 | 0                              | ✅ Forma realista; el recorte superior se cierra con una tapa plana. |
| Huesos            | 30: los 26 huesos del pie + 2 sesamoideos + tibia y peroné distales                         | 16.418                 | 0                              | ✅ Completo y cerrado.                                               |
| Músculos          | 29: intrínsecos plantares y dorsales + extrínsecos de la pierna (con sus tendones distales) | 35.253                 | 285 (en 23 mallas)             | ✅ Defectos menores, invisibles en render.                           |
| Tendones          | 1: tendón calcáneo                                                                          | 2.707                  | 15                             | ⚠️ Solo Aquiles como malla propia.                                   |
| Ligamentos        | 1: ligamento plantar largo                                                                  | 2.678                  | 79                             | ⚠️ Insuficiente para una capa propia.                                |
| Vasos (excluidos) | 34                                                                                          | —                      | —                              | No se usan en la web.                                                |

**No localizados en BodyParts3D:** interóseos dorsales del pie y extensor corto de los dedos; aponeurosis plantar; ligamentos del tobillo (talofibulares, deltoideo, etc.).

Detalle completo: `tools/out/inventory/bodyparts3d-foot.md` (se regenera con `npm run 3d:inspect`).

## 5. Resultados — Z-Anatomy (complemento posible)

| Elemento                                                                                                                                                                                                    | Presente | Geometría                                                                                   | Observación                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Ligamentos del tobillo y del pie (~50: talofibulares anterior/posterior, calcaneofibular, tibiotalar, tibiocalcáneo, tibionavicular, calcaneocuboideos, cuneonaviculares, intermetatarsianos, colaterales…) | ✅       | **Esquemática**: 2-40 polígonos base con subdivisión y grosor (12-424 triángulos evaluados) | Representación simplificada (tiras), no derivada de datos. |
| Cápsulas articulares (MTF, interfalángicas)                                                                                                                                                                 | ✅       | 1.400-1.750 triángulos                                                                      | Más detalladas.                                            |
| Aponeurosis plantar                                                                                                                                                                                         | ✅       | 406 triángulos                                                                              | Relevante para podología (fascitis plantar).               |
| Retináculos (extensores, flexor, peroneos)                                                                                                                                                                  | ✅       | 260-700 triángulos                                                                          | —                                                          |
| Interóseos dorsales del pie                                                                                                                                                                                 | ✅       | 1.946 triángulos                                                                            | Ausentes en BodyParts3D.                                   |
| Tendón calcáneo                                                                                                                                                                                             | ✅       | 4.377 triángulos                                                                            | Equivalente al de BodyParts3D.                             |
| Piel                                                                                                                                                                                                        | ❌       | —                                                                                           | Z-Anatomy no incluye piel.                                 |

⚠️ No verificado todavía: que la geometría de Z-Anatomy esté en el mismo sistema de coordenadas que BodyParts3D (debería, al ser derivada, pero hay que comprobarlo antes de combinarlas).

## 6. Renders de validación

Renders Workbench, colores solo identificativos (no son el estilo final). Están en [`docs/assets/fase2-pie/`](assets/fase2-pie/).

| Vista                                                     | Archivo                                                                                                                                                                                               |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Exterior 3/4                                              | [skin-3q.jpg](assets/fase2-pie/skin-3q.jpg)                                                                                                                                                           |
| Huesos 3/4 · medial · plantar                             | [bones-3q](assets/fase2-pie/bones-3q.jpg) · [bones-medial](assets/fase2-pie/bones-medial.jpg) · [bones-plantar](assets/fase2-pie/bones-plantar.jpg)                                                   |
| Músculos 3/4 · medial · plantar                           | [muscles-3q](assets/fase2-pie/muscles-3q.jpg) · [muscles-medial](assets/fase2-pie/muscles-medial.jpg) · [muscles-plantar](assets/fase2-pie/muscles-plantar.jpg)                                       |
| Tendón calcáneo                                           | [tendons-3q](assets/fase2-pie/tendons-3q.jpg)                                                                                                                                                         |
| Ligamento plantar largo                                   | [ligaments-plantar](assets/fase2-pie/ligaments-plantar.jpg)                                                                                                                                           |
| Conjunto interno (huesos + músculos + tendón + ligamento) | [lateral](assets/fase2-pie/internal-lateral.jpg) · [medial](assets/fase2-pie/internal-medial.jpg) · [dorsal](assets/fase2-pie/internal-dorsal.jpg) · [plantar](assets/fase2-pie/internal-plantar.jpg) |

Prototipo interactivo con el estilo de marca: `npm run dev` → `http://localhost:3000/_lab/pie`.

## 7. Opciones para las capas y recomendación

| Opción              | Capas en la web                                                               | Licencia del GLB                   | Pros                                                                 | Contras                                                                          |
| ------------------- | ----------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **A (recomendada)** | Exterior · Huesos · **Músculos y tendones** (una capa, con Aquiles destacado) | CC BY 4.0                          | Todo derivado de datos, licencia sencilla, sin geometría esquemática | Sin capa de ligamentos.                                                          |
| B                   | A + **Ligamentos** de Z-Anatomy (selección curada, con aponeurosis plantar)   | **CC BY-SA 4.0** (el GLB derivado) | Capa de ligamentos y fascia plantar                                  | Ligamentos esquemáticos; licencia share-alike; requiere alinear las dos fuentes. |
| C                   | A + aponeurosis plantar sola (de Z-Anatomy) como estructura destacada         | CC BY-SA 4.0                       | Muestra la fascia plantar, muy relevante en consulta                 | Igual que B en licencia, con poca geometría añadida.                             |

**Recomendación:** opción **A** para el lanzamiento, con la capa "Músculos y tendones". Si la podóloga considera importante mostrar la fascia plantar o los ligamentos del tobillo, pasar a **C** o **B** tras confirmar con la clínica (y su asesoría) la licencia CC BY-SA del modelo resultante.

## 8. Pendiente para cerrar el Gate 2

**De la podóloga:**

1. Revisar los renders (§6) y el prototipo: ¿estructuras correctas y bien situadas? ¿algo que falte o sobre?
2. Elegir la opción de capas (A, B o C).
3. Elegir 8-12 **estructuras destacadas** con etiqueta (p. ej. calcáneo, astrágalo, 1.er metatarsiano, tendón de Aquiles, tibial posterior, abductor del dedo gordo, ligamento plantar largo…) y validar su nombre en español y una línea de descripción.

**Técnico (tras la decisión):**

1. `extract_foot.py`: fusionar las estructuras no destacadas por capa (draw calls ≤ 40), empties de hotspots y estructuras destacadas separadas.
2. Si B/C: comprobar la alineación Z-Anatomy ↔ BodyParts3D y extender el inventario.
3. Medir FPS en dispositivos reales (iPhone/Safari medio, Android medio, portátil sin GPU dedicada).
4. Pósters de fallback por capa en `public/images/3d-fallbacks/foot/`.
5. Marcar `validatedBy` en el manifiesto.

## 9. Atribución

"BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International". Registrada en `public/models/CREDITS.md` y `tools/assets/manifest.json`.
