# SPEC 08 — EXPERIENCIAS 3D: INTEGRACIÓN, CONTRATOS Y FALLBACKS

> Fases 1-5 del plan v2. Estrategia y licencias en [01-research.md §5-7](../01-research.md); generación de assets en [3d-pipeline.md](../3d-pipeline.md).
> Reglas: **no se simula anatomía que no exista** y **no se atribuyen materiales ni procesos a la plantilla**. Todo modelo provisional se marca.

## 1. Infraestructura común

### 1.1. `useDeviceTier()` → `'full' | 'lite' | 'static'`

```
static  si: sin WebGL2 || saveData || fallo de contexto previo en la sesión || prefers-reduced-motion*
lite    si: viewport < 1024 || deviceMemory ≤ 4 || hardwareConcurrency ≤ 4
full    resto
```

\* Con reduced motion, por defecto se muestra el póster y un botón "Ver modelo 3D". Si se activa, se carga en modo interactivo **sin** autorotación ni scrub.

Se calcula una vez en cliente y se comparte con `useState`. En SSR se asume `static` (se renderiza el póster).

### 1.2. `SceneGate`

- Renderiza en SSR el **póster** de `public/images/3d-fallbacks/<modelo>/…` (AVIF/WebP, mismas dimensiones que el canvas → sin CLS).
- En cliente, con `tier !== 'static'`: importa la escena de forma diferida (`defineAsyncComponent` + `import()`) cuando la sección está a menos de 1 viewport y tras `requestIdleCallback`.
- Pasa del póster al canvas con un fundido al emitirse `ready` (primer frame).
- Ante `webglcontextlost`, vuelve al póster y marca la sesión.
- Muestra indicador de carga solo si tarda > 600 ms.
- **Un único `TresCanvas` por página.**

### 1.3. Ajustes de render

- `dpr` `[1, 1.5]` en lite y `[1, 2]` en full.
- `renderMode: 'on-demand'` en reposo; continuo solo durante scrub o interacción. Pausa fuera de viewport o con la pestaña oculta.
- Tone mapping AgX/ACES, salida sRGB.
- Luz: `HemisphereLight` (azul hielo/blanco) + 1-2 `DirectionalLight` + `RoomEnvironment` (PMREM) para reflejos. Sin HDR externo.
- Sin sombras en tiempo real; sombra de contacto falsa.
- `GLTFLoader.setMeshoptDecoder(MeshoptDecoder)` (decodificador incluido en three).
- `dispose()` de geometrías, materiales, texturas y render targets al desmontar; `renderer.info` vigilado en dev.

### 1.4. Integración con GSAP

- Las escenas exponen un **estado declarativo** como refs (`progress`, `activeLayer`, `explode`, `fiberProgress`, `rotationY`).
- ScrollTrigger solo anima esas refs; la escena las lee en su bucle de render. 3D y scroll quedan desacoplados y testeables.
- `gsap.matchMedia()` define las variantes por breakpoint y reduced motion. Limpieza con `gsap.context().revert()` en `onUnmounted`.

### 1.5. Presupuestos

| Asset                        | full                                   | lite                |
| ---------------------------- | -------------------------------------- | ------------------- |
| Pie anatómico GLB            | ≤ 2,5 MB · ≤ 250k tri                  | ≤ 1 MB · ≤ 80k tri  |
| Plantilla GLB                | ≤ 500 KB · ≤ 60k tri                   | (mismo GLB)         |
| Fibras                       | 6.000 instancias                       | 1.500               |
| Chunk JS three + tres (gzip) | objetivo ≤ 200 KB, cargado tras el LCP | —                   |
| Draw calls                   | ≤ 40                                   | ≤ 20                |
| FPS                          | 60 (≥ 55 medido)                       | ≥ 30 en móvil medio |

## 2. Pie anatómico (`FootAnatomy.client.vue`)

### 2.1. Contrato del GLB

Grupos presentes **solo si existen en la fuente y han sido validados** (Gate 2):

```
Foot (root)
├─ exterior | exterior_simplified    # piel de la fuente, o envolvente derivada (rotulada como simplificada)
├─ bones                             # hijos destacados con id estable (p. ej. calcaneus, talus…) + bones_rest
├─ muscles                           # destacados + muscles_rest
├─ tendons                           # destacados + tendons_rest
├─ ligaments                         # destacados + ligaments_rest
└─ hotspots                          # empties: nombre = id de etiqueta
```

- Custom property `layer` en cada nodo y `sourceId` (FMA/TA) en los destacados.
- La UI se construye **a partir de los grupos presentes**: si no hay `ligaments`, no aparece su botón.
- Las etiquetas visibles (nombre en español + descripción breve) viven en `app/data/anatomy.ts`, enlazadas por id y **validadas por la podóloga**.

### 2.2. Materiales (estética de marca)

| Capa       | Material                                                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Exterior   | Shader fresnel "rayos X" (borde cian `#1CA8E0` → centro transparente) cuando hay una capa interna activa; satinado azul hielo cuando es la activa. |
| Huesos     | Blanco azulado `#F5F8FC`, rugosidad media, clearcoat leve.                                                                                         |
| Músculos   | Azul `#1070B4` translúcido (`transmission` solo en full; en lite, opacidad + emisivo).                                                             |
| Tendones   | Cian emisivo suave.                                                                                                                                |
| Ligamentos | Azul hielo `#B9E5F3` semitransparente con borde cian.                                                                                              |
| Resaltado  | Emisivo + rim light en la estructura seleccionada; resto de la capa al 40 %.                                                                       |

Como máximo 2 capas translúcidas visibles a la vez, con `renderOrder` fijo y `depthWrite: false` en las translúcidas.

### 2.3. Interacción y secuencia

Ver spec 03 §1. Picking por raycaster solo sobre mallas destacadas. Rotación por arrastre horizontal y también por botones (accesible). `touch-action: pan-y`.

## 3. Estudio biomecánico (sin modelo 3D)

SVG + CSS + GSAP (spec 04 §1.3-1.4). Componentes en `app/components/graphics/`:

| Componente           | Contenido                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `Footprint`          | Huella izquierda/derecha (contorno y relleno).                                                                            |
| `PressureMap`        | Gradientes radiales + `feGaussianBlur` + `clipPath` de la huella; estados `{x, y, r, intensity}[]` interpolados con GSAP. |
| `SupportPoints`      | Puntos de apoyo con pulso CSS.                                                                                            |
| `PressureCenterPath` | Trayectoria del centro de presiones (`stroke-dashoffset`) + punto móvil.                                                  |
| `ProgressionLine`    | Línea de progresión de la marcha.                                                                                         |
| `GaitSequence`       | Contacto de talón → apoyo medio → despegue, alternando pies.                                                              |

- Rótulo fijo **"Visualización ilustrativa"**. Sin cifras ni unidades que parezcan mediciones.
- Mejora opcional (`PressureShader.client.vue`): solo si en el laboratorio demuestra valor visual claro frente al SVG. Usa los mismos datos de estados. No es requisito.

## 4. Plantilla conceptual (`InsoleLayers.client.vue`) y fibras (`FiberField.client.vue`)

### 4.1. Contrato del GLB

```
Insole (root)
├─ layer_top
├─ layer_middle
└─ layer_base      # (ids definidos en tools/blender/config/insole.json)
```

Custom properties por capa: `id`, `order`, `explodeOffset`. Las **etiquetas visibles** salen de `app/data/insole.ts` y son genéricas ("Capa superior", "Capa intermedia", "Base") hasta que la clínica confirme otra información.

### 4.2. Explosión

`position.y = explode * explodeOffset_i`, con leve rotación del grupo (≤ 10°) y de la cámara (≤ 15°). Etiquetas DOM proyectadas o `Html` de cientos, con línea guía SVG. Lista equivalente `<ol>` en el DOM.

### 4.3. Fibras con `InstancedMesh`

- Muestreo de N puntos sobre `layer_top` con `MeshSurfaceSampler` (semilla fija).
- Geometría base: cilindro fino de baja resolución (6 lados) o quad orientado.
- Atributos por instancia (`InstancedBufferAttribute`): `aStart` (posición dispersa), `aEnd` (punto en la superficie), `aDir` (dirección tangente alineada al eje longitudinal con variación), `aDelay`, `aLength`.
- Vertex shader con uniform `uProgress` 0→1 y 5 fases:

| `uProgress` | Fase                                                                                    |
| ----------- | --------------------------------------------------------------------------------------- |
| 0–0.2       | Aparición dispersa (escala 0→1, opacidad).                                              |
| 0.2–0.45    | Agrupación: interpolación `aStart → aEnd` con `aDelay` y easing.                        |
| 0.45–0.65   | Superficie: las fibras se alinean con `aDir` y aparece `layer_top` en alfa o wireframe. |
| 0.65–0.85   | Volumen: `layer_middle` y `layer_base` crecen en espesor (escala Y 0→1).                |
| 0.85–1      | Plantilla final: materiales completos, fibras desvanecidas.                             |

- Todo en GPU: ninguna matriz se actualiza en CPU por frame. Recuento según el nivel (6.000 / 1.500).
- Presentado como **metáfora visual de construcción**, no como proceso de fabricación.

## 5. Fallbacks (`static`)

| Experiencia           | Fallback                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------- |
| Pie                   | Un póster por capa disponible, conmutable con los mismos controles; etiquetas como lista. |
| Biomecánico           | Ya es SVG: funciona igual, sin morph.                                                     |
| Plantilla (explosión) | Póster completo + póster explotado + lista numerada de capas.                             |
| Fibras                | Póster final + 5 pasos como lista.                                                        |

Todos los pósters los genera `render_validation.py` con el mismo encuadre que el canvas ([3d-pipeline.md §8](../3d-pipeline.md)).

## 6. Gates

- **Gate 2 (pie):** inventario + renders aprobados por la podóloga; peso y FPS medidos en dispositivo real (iPhone/Safari medio, Android medio, portátil sin GPU dedicada); licencia resultante decidida. Si no es viable → alcance reducido o plan B, informando antes de implementar.
- **Gate 3 (biomecánico):** aprobación visual, rendimiento y rótulos ilustrativos.
- **Gate 4 (plantilla):** parámetros validados visualmente, rendimiento de las fibras y sin atribuciones de materiales o procesos.
