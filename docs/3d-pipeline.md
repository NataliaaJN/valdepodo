# PIPELINE DE RECURSOS 3D — VALDEPODO

> Documento operativo. Decisiones y justificación en [01-research.md §5-7](01-research.md); integración en la web en [specs/08-experiencias-3d.md](specs/08-experiencias-3d.md).
> Estado (Fase 2, 10/11/2026): **pipeline del pie implementado** (inventario, renders de validación, extracción y optimización); resultados en [fase2-viabilidad-pie.md](fase2-viabilidad-pie.md). Pendientes: versión final de `extract_foot.py` (fusión por capa, hotspots), pósters de fallback, `build_insole.py` (Fase 4).
>
> | Fase 2                                                                                                         | Ruta                                                                                                        |
> | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
> | Inventario espacial de BodyParts3D (región del pie por huesos ancla, todas las mallas, clasificación por capa) | `tools/blender/inspect_source.py` → `tools/out/inventory/bodyparts3d-foot.{json,md}` (`npm run 3d:inspect`) |
> | Inventario de Z-Anatomy (abre el `.blend` sin autoejecución; triángulos evaluados)                             | `tools/blender/inspect_zanatomy.py` (`npm run 3d:inspect-za`)                                               |
> | Renders de validación por capa y vista + calidad de malla                                                      | `tools/blender/render_foot_validation.py` (`npm run 3d:foot-validation`)                                    |
> | Extracción del prototipo GLB (una malla por estructura, `layer`/`sourceId`/`fmaName` como extras)              | `tools/blender/extract_foot.py`                                                                             |
> | Operaciones anatómicas compartidas (importar OBJ, soldar, recortar, medir)                                     | `tools/blender/lib/anatomy.py`                                                                              |
> | Parámetros (fuentes, anclas, márgenes, reglas de clasificación, colores)                                       | `tools/blender/config/foot.json`                                                                            |
>
> Lecciones: (1) las mallas OBJ de BodyParts3D traen los vértices sin soldar: hay que unirlos (`remove_doubles`) antes de medir o recortar, y pasan de ~43.000 a ~380 aristas abiertas; (2) en la clasificación por nombre el orden importa (`tibialis` ≠ `tibia`, `tibial artery` ≠ hueso); (3) el render final de Workbench toma el fondo del _world_, no del color del viewport.
>
> | Implementado                                                                                                  | Ruta                                                     |
> | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
> | Lanzador headless (localiza Blender, `--check`, códigos de salida)                                            | `tools/blender/run-blender.mjs`                          |
> | Utilidades `bpy`: argumentos, escena y render Workbench, exportación GLB filtrada contra la API, informe JSON | `tools/blender/lib/`                                     |
> | Script de prueba (2 capas `layer_*` → GLB + informe + render)                                                 | `tools/blender/test_cube.py` + `config/test-cube.json`   |
> | Optimización gltf-transform (meshopt, variantes, actualiza el manifiesto)                                     | `tools/assets/optimize.mjs`                              |
> | Comprobación de manifiesto, créditos y presupuestos (`--production` exige `validatedBy`)                      | `tools/assets/check-assets.mjs`                          |
> | Manifiesto y créditos                                                                                         | `tools/assets/manifest.json`, `public/models/CREDITS.md` |
>
> Blender 5.2.4 LTS instalado en `%LOCALAPPDATA%\Programs\blender-5.2.4-windows-x64\` (portable, SHA-256 verificado contra download.blender.org). `run-blender.mjs` lo encuentra automáticamente; `BLENDER_BIN` en `.env` tiene prioridad.
> Lección aprendida: Blender no resuelve rutas relativas de render respecto al directorio de trabajo, así que los scripts convierten siempre a rutas absolutas.

## 1. Principios

1. **Separación total de la app Nuxt.** El pipeline vive en `tools/` y produce ficheros estáticos (`public/models/*.glb`, `public/images/3d-fallbacks/*`). La app no importa nada de `tools/`.
2. **Reproducible.** Mismas fuentes + misma configuración + misma versión de Blender = mismo resultado. Semillas fijas y sin pasos manuales en Blender.
3. **Parametrizado.** Todo lo ajustable está en JSON (`tools/blender/config/`), no en el código.
4. **Verificable.** Cada ejecución genera renders de validación y un informe JSON (triángulos, objetos, peso, procedencia).
5. **Trazable legalmente.** Cada GLB tiene su entrada de procedencia y licencia; el build de la app comprueba que existe.
6. **Sin anatomía inventada.** Los scripts del pie solo **extraen, limpian y estilizan** geometría de la fuente. Nunca crean estructuras.

## 2. Estructura

```
tools/
├─ blender/
│  ├─ inspect_source.py        # inventario de la fuente anatómica (pie/tobillo)
│  ├─ extract_foot.py          # extracción, limpieza, agrupación por capas, export GLB
│  ├─ build_insole.py          # plantilla paramétrica por capas, export GLB
│  ├─ render_validation.py     # renders de validación y pósters de fallback
│  ├─ lib/
│  │  ├─ cli.py                # parseo de argumentos tras "--"
│  │  ├─ scene.py              # reset de escena, unidades, cámara, luces
│  │  ├─ mesh_ops.py           # limpieza (merge by distance, normales, decimate, voxel remesh)
│  │  ├─ materials.py          # materiales base por capa (marcadores; el look final se hace en la web)
│  │  ├─ export.py             # wrapper de bpy.ops.export_scene.gltf con parámetros fijados
│  │  └─ report.py             # informe JSON por ejecución
│  └─ config/
│     ├─ foot.json             # allowlist de estructuras, mapeo a capas, decimación por capa, recorte
│     ├─ insole.json           # parámetros de la plantilla
│     └─ render.json           # cámaras, resoluciones, fondo, vistas por modelo
├─ assets/
│  ├─ optimize.mjs             # gltf-transform: dedupe, prune, weld, simplify, meshopt, variantes full/lite
│  ├─ manifest.json            # versión, fuente, checksum, licencia de cada modelo
│  └─ check-credits.mjs        # falla si un GLB no tiene entrada en CREDITS.md / manifest
├─ sources/                    # (ignorado por git) descargas: BodyParts3D, Z-Anatomy
└─ out/                        # (ignorado por git) intermedios *.raw.glb, renders de validación, informes
public/
├─ models/
│  ├─ foot.full.glb · foot.lite.glb
│  ├─ insole.glb
│  └─ CREDITS.md
└─ images/3d-fallbacks/
   ├─ foot/{exterior,muscles,tendons,ligaments,bones}.{avif,webp}   (800 y 1600 px)
   └─ insole/{complete,exploded,fibers-final}.{avif,webp}
```

`.gitignore`: `tools/sources/`, `tools/out/`.

## 3. Dependencias

| Dependencia                                                                 | Versión                               | Uso                                                                   | Instalación                                                                                                            |
| --------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Blender                                                                     | **5.2 LTS** (soporte hasta jul. 2028) | `bpy` headless: importar, limpiar, generar, exportar glTF, renderizar | Ver §4                                                                                                                 |
| Node.js                                                                     | La del proyecto (≥ 20; actual 26.13)  | Scripts de optimización                                               | Ya instalado                                                                                                           |
| `@gltf-transform/cli` (+ `@gltf-transform/core`, `extensions`, `functions`) | Última estable al instalar            | Optimización y compresión meshopt                                     | `npm i -D @gltf-transform/cli @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer` |
| `meshoptimizer`                                                             | Última estable                        | Codificador meshopt para gltf-transform (MIT)                         | Incluido arriba                                                                                                        |
| Python                                                                      | El embebido en Blender                | Scripts `bpy`                                                         | No requiere instalación aparte                                                                                         |
| (Opcional) `sharp`                                                          | —                                     | Convertir renders PNG → AVIF/WebP                                     | Dependencia transitiva de `@nuxt/image`/IPX o `npm i -D sharp`                                                         |

No se requieren add-ons de Blender: el importador OBJ y el exportador glTF vienen incluidos.

## 4. Instalación de Blender (Windows)

1. Descargar **Blender 5.2 LTS** desde `https://www.blender.org/download/lts/` (instalador `.msi` o `.zip` portable). Se recomienda el **portable** en una ruta sin espacios, p. ej. `C:\tools\blender-5.2\`.
2. Definir la variable de entorno `BLENDER_BIN` con la ruta del ejecutable (`C:\tools\blender-5.2\blender.exe`). Los scripts npm la usan; no se depende del `PATH`.
3. Verificar: `"%BLENDER_BIN%" --version` → debe mostrar `Blender 5.2.x`.
4. Verificar el exportador: `"%BLENDER_BIN%" -b --factory-startup --python-expr "import bpy; print(hasattr(bpy.ops.export_scene, 'gltf'))"` → `True`.

`--factory-startup` en todas las ejecuciones: ignora preferencias y add-ons del usuario, para que el resultado sea el mismo en cualquier equipo.

## 5. Automatización con Python

### 5.1. Invocación

```bash
"$BLENDER_BIN" -b --factory-startup -P tools/blender/build_insole.py -- --config tools/blender/config/insole.json --out tools/out/insole.raw.glb
```

- Todo lo que va tras `--` es del script (lo parsea `lib/cli.py` con `argparse` sobre `sys.argv[sys.argv.index('--')+1:]`).
- Código de salida ≠ 0 ante cualquier error (excepciones no capturadas + `sys.exit(1)`), para que npm o CI lo detecten.

### 5.2. Scripts npm (en `package.json` de la raíz)

| Script            | Acción                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------- |
| `3d:check-env` ✅ | Verifica Blender 5.2 y el exportador glTF                                               |
| `3d:test-cube` ✅ | Modelo de prueba (Fase 1)                                                               |
| `3d:smoke` ✅     | `test-cube` → optimizar → comprobar (prueba de extremo a extremo)                       |
| `3d:inspect`      | `inspect_source.py` → `tools/out/inventory.json` + `inventory.md`                       |
| `3d:foot`         | `extract_foot.py` → `tools/out/foot.raw.glb`                                            |
| `3d:insole`       | `build_insole.py` → `tools/out/insole.raw.glb`                                          |
| `3d:render`       | `render_validation.py` → `tools/out/validation/*.png` + pósters                         |
| `3d:optimize` ✅  | `tools/assets/optimize.mjs <nombre>` → `public/models/*.glb` (variantes del manifiesto) |
| `3d:check` ✅     | `check-assets.mjs`: manifiesto, créditos y presupuestos (peso, triángulos)              |
| `3d:all`          | Todo en orden                                                                           |

### 5.3. Papel de Claude

- Escribe y mantiene los scripts, sus configuraciones y los informes.
- Ejecuta el pipeline en local y **revisa los renders de validación** (lectura de imágenes) para detectar errores evidentes: piezas que faltan, normales invertidas, solapes, encuadres.
- **No decide la validez anatómica:** la valida la podóloga sobre los renders.
- No descarga fuentes ni instala software sin confirmación previa.

## 6. Flujos por modelo

### 6.1. Pie anatómico

1. **Fuentes** (descarga manual o con confirmación, a `tools/sources/`):
   - BodyParts3D 4.0 OBJ (`isa_BP3D_4.0_obj_99.zip` 136 MB / `partof_BP3D_4.0_obj_99.zip` 62 MB) — CC BY 4.0.
   - Z-Anatomy (`Z-Anatomy.zip` del repo `Z-Anatomy/Models-of-human-anatomy`, o `.blend` del repo de LluisV) — CC BY-SA 4.0. Registrar commit y fecha.
2. **`inspect_source.py`:** carga la fuente; filtra los objetos por nombre/ID dentro de la región pie-tobillo (bounding box + lista de términos: _calcaneus, talus, navicular, cuboid, cuneiform, metatarsal, phalanx, plantar, hallucis, digitorum, tibialis, peroneus/fibularis, calcaneal tendon, ligament…_) y genera el inventario: nombre, ID (FMA/TA), sistema, triángulos, manifold, normales, bbox y licencia de origen. **Es el gate de viabilidad** (research §5.A).
3. **`config/foot.json`:** allowlist explícita (solo lo validado), mapeo estructura → capa (`exterior | bones | muscles | tendons | ligaments`), estructuras destacadas (se mantienen separadas), decimación por capa y recorte proximal (altura de tobillo).
4. **`extract_foot.py`:**
   - importa solo la allowlist;
   - limpia: merge by distance, recalcular normales, eliminar sueltos, voxel remesh opcional por capa;
   - fusiona las mallas no destacadas por capa;
   - normaliza escala (metros) y orientación (Y-up, pie apoyado en Y=0, talón en −Z);
   - crea los _empties_ de hotspots;
   - nombra según el contrato GLB (spec 08 §2.1) y exporta.
   - **Nunca exporta objetos fuera de la allowlist**, lo que evita incluir modelos NC del paquete Z-Anatomy.
5. **Envolvente exterior** (solo si no hay piel en la fuente y la podóloga lo aprueba): unión de capas → voxel remesh grueso → suavizado → decimación. Se nombra `exterior_simplified` y se rotula como silueta simplificada.

### 6.2. Plantilla conceptual

`build_insole.py` + `config/insole.json`:

```json
{
  "version": "0.1.0",
  "side": "right",
  "seed": 42,
  "length_mm": 260,
  "width_forefoot_mm": 95,
  "width_heel_mm": 62,
  "arch_height_mm": 14,
  "arch_peak": 0.58,
  "heel_cup_depth_mm": 12,
  "thickness_mm": 4,
  "layers": [
    { "id": "top", "label": "Capa superior", "thickness_ratio": 0.25, "zone": "full", "color": "#B9E5F3" },
    {
      "id": "middle",
      "label": "Capa intermedia",
      "thickness_ratio": 0.45,
      "zone": "full",
      "color": "#1CA8E0"
    },
    { "id": "base", "label": "Base", "thickness_ratio": 0.3, "zone": "rearfoot", "color": "#1070B4" }
  ],
  "export": { "subdivision": 2, "bevel_mm": 0.6 }
}
```

> Valores **conceptuales** (no clínicos), solo para dar forma. Las etiquetas son genéricas a propósito.

Pasos:

1. Contorno 2D paramétrico (spline cerrada a partir de longitud y anchuras).
2. Malla rellena con resolución uniforme.
3. Elevación: arco interno con función suave (gaussiana desplazada a `arch_peak`) y copa de talón (`heel_cup_depth_mm`).
4. Por capa: duplicar la superficie, aplicar `Solidify` con el espesor `thickness_ratio × thickness_mm`, recortar por `zone` y apilarla sobre la anterior.
5. Subdivisión + bevel; aplicar modificadores.
6. Nombrar `layer_<id>` y exportar.

Las **fibras no se generan en Blender**: la web las crea en tiempo real con `InstancedMesh` sobre la superficie de `layer_top` (spec 08 §4.3).

## 7. Exportación y optimización GLB

### 7.1. Exportación desde Blender (`lib/export.py`)

`bpy.ops.export_scene.gltf` con: formato GLB, solo objetos seleccionados, modificadores aplicados, Y-up, normales, **sin** compresión Draco (la compresión se hace después), sin cámaras ni luces, materiales básicos, extras/custom props activados (para pasar ids de capa y hotspots).

> ⚠️ Los nombres exactos de los parámetros del exportador se verificarán contra la API de Blender 5.2 al escribir el script (pueden variar entre versiones).

### 7.2. Optimización (`tools/assets/optimize.mjs`, gltf-transform)

`dedupe → prune → weld → (simplify por variante) → quantize → meshopt`.

| Variante        | Simplify            | Objetivo              |
| --------------- | ------------------- | --------------------- |
| `foot.full.glb` | ratio según informe | ≤ 2,5 MB · ≤ 250k tri |
| `foot.lite.glb` | más agresivo        | ≤ 1 MB · ≤ 80k tri    |
| `insole.glb`    | ligero              | ≤ 500 KB · ≤ 60k tri  |

- Texturas (si las hubiera): WebP ≤ 1024 px.
- En la web, `GLTFLoader.setMeshoptDecoder(MeshoptDecoder)` (decodificador incluido en three, requiere WebAssembly).
- `3d:check` falla si se supera un presupuesto.

## 8. Renders de validación y fallbacks

`render_validation.py` + `config/render.json`:

| Tipo       | Contenido                                                                                                                                                                   | Destino                                                     | Uso                           |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------- |
| Validación | Pie: cada capa sola y combinada en vistas lateral, medial, plantar, dorsal y 3/4, con nombres de estructura superpuestos (overlay). Plantilla: completa, explotada, cortes. | `tools/out/validation/` (no se publican)                    | Revisión de Claude + podóloga |
| Fallback   | Mismo encuadre y relación de aspecto que el canvas de la web, fondo transparente o de marca                                                                                 | `public/images/3d-fallbacks/` en AVIF + WebP, 800 y 1600 px | Póster SSR y modo `static`    |

- Motor: Workbench para validación (rápido, sin ruido) y Eevee para fallbacks (look cercano al de la web).
- Los fallbacks se regeneran en cada versión del modelo, para no quedar desincronizados.

## 9. Versionado

| Qué                           | Dónde                                           | Git                                                  |
| ----------------------------- | ----------------------------------------------- | ---------------------------------------------------- |
| Scripts y configs             | `tools/blender/`                                | ✅                                                   |
| Fuentes descargadas (≈200 MB) | `tools/sources/`                                | ❌ (URL, fecha, commit y SHA-256 en `manifest.json`) |
| Intermedios y validación      | `tools/out/`                                    | ❌                                                   |
| GLB finales y fallbacks       | `public/models/`, `public/images/3d-fallbacks/` | ✅ (pesos acotados; si crecen, valorar Git LFS)      |
| Manifiesto                    | `tools/assets/manifest.json`                    | ✅                                                   |

`manifest.json` (por modelo): `version` (semver; _major_ = cambio de contrato de nodos), `generatedAt`, `blenderVersion`, `config` (ruta + hash), `sources[]` (`name`, `url`, `retrievedAt`, `revision`, `sha256`, `license`), `outputs[]` (`file`, `bytes`, `triangles`), `validatedBy` (persona y fecha, o `null`).

La app solo debe usar modelos con `validatedBy` informado en producción: `check-pending` también comprueba esto.

## 10. Licencias y atribuciones

- `public/models/CREDITS.md`, con una entrada por GLB:
  - **foot.\*.glb:** fuentes (BodyParts3D 4.0 y/o Z-Anatomy) y sus textos de atribución literales:
    - "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International";
    - si procede: "Z-Anatomy – The libre 3D atlas of anatomy – CC BY-SA 4.0" y la atribución de BodyParts3D que exige Z-Anatomy;
    - licencia resultante del GLB (CC BY 4.0 o CC BY-SA 4.0) y descripción de las modificaciones (extracción, limpieza, decimación, estilizado).
  - **insole.glb:** obra propia del proyecto.
- Página `/creditos` generada desde el manifiesto, enlazada desde el footer y desde un pie discreto bajo el modelo 3D.
- **Allowlist obligatoria** para fuentes con contenido mixto (Z-Anatomy incluye modelos con licencia **no comercial**: oído interno, riñón…). Ningún objeto fuera de la allowlist llega al GLB.
- ⚠️ La licencia resultante y el texto de créditos se confirman con la asesoría de la clínica antes del lanzamiento.

## 11. Checklist de una ejecución

- [ ] `BLENDER_BIN` apunta a 5.2.x.
- [ ] Fuentes presentes con el checksum del manifiesto.
- [ ] `3d:all` termina con código 0.
- [ ] Informe sin objetos fuera de la allowlist.
- [ ] Presupuestos de peso y triángulos cumplidos (full y lite).
- [ ] Renders de validación revisados (Claude) y aprobados (podóloga, en el caso del pie).
- [ ] Fallbacks regenerados.
- [ ] `CREDITS.md` y `manifest.json` actualizados.
