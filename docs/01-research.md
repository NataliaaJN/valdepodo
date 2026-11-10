# VALDEPODO — RESEARCH Y AUDITORÍA

> Documento de diagnóstico previo al desarrollo.
> Versión 2 (revisión crítica) · 10/11/2026 · Relacionado: [02-plan.md](02-plan.md) · [3d-pipeline.md](3d-pipeline.md) · [specs/](specs/)

---

## Leyenda de estados

| Marca              | Significado                                                                            |
| ------------------ | -------------------------------------------------------------------------------------- |
| 🔒 **CERRADA**     | Decisión tomada. Solo se reabre con justificación técnica comunicada.                  |
| 💡 **RECOMENDADA** | Propuesta justificada; se aplica salvo objeción.                                       |
| ⚠️ **VALIDAR**     | Depende de una comprobación (técnica, legal o de la clínica) antes de darla por buena. |

## Registro de la revisión (v1 → v2)

| Cambio                                                                                                                                                                                                           | Motivo                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Logo disponible** (raster de la ficha de Google, 1020×1020 px). Colores muestreados: azul `#1070B4`, cian `#1CA8E0`, gris `#545454`.                                                                           | Aportado por la clínica. Ver §8.                                                                                                                                                                                         |
| **Datos públicos de la clínica localizados** (dirección, teléfono, horario, coordenadas, valoración) en la ficha de Google Maps.                                                                                 | Investigación de "Valdepodo". Ver §3. Siguen pendientes de confirmación.                                                                                                                                                 |
| **Licencia de BodyParts3D corregida**: desde el 27/02/2025 es **CC BY 4.0** (antes CC BY-SA 2.1 JP). Z-Anatomy sigue en **CC BY-SA 4.0**.                                                                        | v1 citaba la licencia antigua. Cambia la estrategia de fuente del pie (§5.1).                                                                                                                                            |
| **Z-Anatomy: contenido del pie no verificado.** Su documentación no detalla qué incluye para el pie (ligamentos, tendones, piel) e incluye algunos modelos de terceros **no comerciales** (oído interno, riñón). | v1 daba por hecho la separación de estructuras. Ahora es un gate de inspección.                                                                                                                                          |
| **Estrategia 3D definitiva** en tres elementos independientes (A pie · B biomecánico · C plantilla).                                                                                                             | Decisiones nuevas del proyecto.                                                                                                                                                                                          |
| **Pipeline 3D documentado** en [3d-pipeline.md](3d-pipeline.md), con rutas `tools/blender/config/` y `public/images/3d-fallbacks/`.                                                                              | Sustituye a `public/posters/` de la v1.                                                                                                                                                                                  |
| **(Fase 1) SVG del logo recibido**: colores `#1270B6` / `#1EABE1` / `#565656`; es un calco automático sin curvas.                                                                                                | Ver §8.1.                                                                                                                                                                                                                |
| **(Fase 1) TresJS sin `@tresjs/nuxt`**: se usa `@tresjs/core` + `@tresjs/cientos` y se registran sus elementos en el compilador de Vue (`templateCompilerOptions`).                                              | `@tresjs/nuxt` 5.8.1 declara `@nuxt/ui` como dependencia (para su panel de devtools): instalaría una biblioteca de componentes UI que el stack excluye. La integración manual es de una línea y no pierde funcionalidad. |
| **(Fase 1) TypeScript fijado en ~6.0** (no 7.x).                                                                                                                                                                 | TypeScript 7 es la versión nativa; por precaución se usa la última línea basada en JS, compatible con vue-tsc/Volar. Se revisará cuando vue-tsc declare soporte de TS 7.                                                 |
| **Blender 5.2 LTS** como versión objetivo (v1 decía "4.x LTS").                                                                                                                                                  | 5.2 es la LTS vigente (julio 2026, soporte hasta julio 2028).                                                                                                                                                            |
| **Plantilla = representación conceptual** con parámetros (longitud, anchura, arco, talón, espesor). Sin materiales ni procesos atribuidos.                                                                       | Decisión nueva. v1 proponía capas "reales" desde el inicio.                                                                                                                                                              |
| **Plan reordenado**: primero viabilidad 3D, después el resto de la web.                                                                                                                                          | Decisión nueva. Ver §11 y [02-plan.md](02-plan.md).                                                                                                                                                                      |
| Instagram y LinkedIn **no accesibles sin sesión**: no se han podido extraer fotos ni datos.                                                                                                                      | Ver §3.3.                                                                                                                                                                                                                |

---

## 0. Resumen ejecutivo

- **Repositorio vacío** (solo `.git`, `master` sin commits). Se construye desde cero con el stack de `stack-tecnologico.md`, que se mantiene íntegro.
- **Clínica identificada:** _VALDEPODO Clínica de podología_, Calle Dr. Barraquer 7, 28342 Valdemoro (Madrid), según su ficha pública de Google. Datos a confirmar por la clínica antes de publicarlos.
- **Logo disponible solo en raster.** Sirve para la propuesta visual; para producción y para la animación de carga se necesita **el vector original** (o una vectorización aprobada por la clínica).
- **3D, estrategia definitiva:**
  - **A. Pie anatómico.** Geometría de **BodyParts3D 4.0 (CC BY 4.0)** y/o **Z-Anatomy (CC BY-SA 4.0)**, procesada con Blender + Python (scripts escritos con Claude) y exportada a GLB. **Viabilidad pendiente** de inspeccionar qué estructuras del pie existen realmente.
  - **B. Estudio biomecánico.** SVG + CSS + GSAP, sin modelos externos.
  - **C. Plantilla conceptual.** Generada con Blender + Python a partir de parámetros y exportada a GLB, con fibras en Three.js mediante `InstancedMesh`.
- **Riesgos principales:**
  - calidad y contenido real del modelo anatómico;
  - rendimiento 3D en móvil;
  - conflicto entre scroll pineado, WebGL y transiciones de página;
  - protección de datos en el formulario;
  - derechos de imagen (fotos de redes, reseñas, retratos).
- **Siguiente paso:** preparar el entorno y lanzar el **prototipo anatómico** (fases 1-2 del nuevo plan) antes de diseñar el resto de la web.

---

## 1. Estado actual del proyecto

| Elemento                         | Estado                                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Repositorio `valdepodo/`         | Vacío. Rama `master` sin commits; la rama principal declarada es `main` (aún no existe).                           |
| Remoto                           | `origin` → GitHub `NataliaaJN/valdepodo` (SSH).                                                                    |
| Framework / dependencias / rutas | Ninguno.                                                                                                           |
| Documentación                    | `../stack-tecnologico.md`, `../research/research.txt`, especificación maestra, este `docs/`.                       |
| Logotipo                         | **Raster** 1020×1020 (WebP con pérdida) desde la ficha de Google. Sin vector.                                      |
| Fotografías reales               | Ninguna en el workspace.                                                                                           |
| Modelos 3D                       | Ninguno.                                                                                                           |
| Entorno                          | Windows 11, Node v26.13.0, npm 11.20.0. pnpm no activado. **Blender no instalado.** Python del sistema sin Pillow. |

🔒 No hay código existente que preservar ni tecnologías que sustituir.

---

## 2. Tecnologías y dependencias

Se mantienen las decisiones de la v1. Las versiones se fijan con `npm view <paquete> version` en el momento de instalar.

### 2.1. Núcleo de la aplicación

| Área              | Paquete                                                  | Estado investigado                                                                            | Decisión                                                                                                   |
| ----------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Framework         | `nuxt` 4.x                                               | Última estable reportada: 4.6.x (oct. 2026). Nuxt 5 previsto para Q4 2026 (estimado).         | 🔒 Nuxt 4, última minor. **No** se migra a Nuxt 5 durante el desarrollo.                                   |
| Lenguaje          | `typescript` ~6.0.3 + `vue-tsc` 3.3                      | TS 7.0 (nativo) es `latest`; vue-tsc usa la API JS de TS.                                     | 🔒 `strict`, `noUncheckedIndexedAccess`, typecheck en CI. TS fijado en 6.0.                                |
| Estilos           | `tailwindcss` v4 + `@tailwindcss/vite`                   | El módulo `@nuxtjs/tailwindcss` va por detrás con v4.                                         | 🔒 Plugin de Vite y tokens en `@theme`.                                                                    |
| Animación         | `gsap` (incluye ScrollTrigger)                           | Gratuito también para uso comercial (licencia estándar "no charge").                          | 🔒                                                                                                         |
| 3D                | `three` 0.187, `@tresjs/core` 5.10                       | core 5.10.1 (peer: `three >=0.133`, `vue >=3.4`). `@tresjs/nuxt` 5.8.1 depende de `@nuxt/ui`. | 🔒 TresJS v5 **core sin el módulo Nuxt** (ver registro de revisión). Escenas en componentes `.client.vue`. |
| Utilidades 3D     | `@tresjs/cientos`                                        | Ecosistema TresJS (cargador GLTF, controles, `Html`).                                         | 💡 Solo si se usan sus helpers.                                                                            |
| Descompresión GLB | `MeshoptDecoder` (incluido en `three/examples/jsm/libs`) | meshoptimizer es MIT. Requiere WebAssembly.                                                   | 🔒 Meshopt como compresión de geometría (sin dependencia extra).                                           |
| Formularios       | `vee-validate` v5 + `zod`                                | v5 deprecia `@vee-validate/zod` y `toTypedSchema`; acepta Standard Schema (Zod ≥ 3.24).       | 🔒 v5 + Zod. ⚠️ Confirmar Zod 4 al instalar.                                                               |
| Estado            | Composables Vue/Nuxt                                     | —                                                                                             | 🔒 Sin Pinia.                                                                                              |
| Calidad           | `@nuxt/eslint`, `prettier`                               | —                                                                                             | 🔒                                                                                                         |
| Pruebas           | `vitest`, `@nuxt/test-utils`, `@vue/test-utils`          | —                                                                                             | 🔒                                                                                                         |

### 2.2. Módulos Nuxt propuestos (justificados por requisitos del stack)

| Módulo                                                   | Requisito                            | Estado                                                                                  |
| -------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------- |
| `@nuxt/fonts`                                            | Tipografía autoalojada, sin CLS      | 💡                                                                                      |
| `@nuxt/image`                                            | WebP/AVIF, lazy loading              | 💡                                                                                      |
| `@nuxtjs/sitemap` + `@nuxtjs/robots` + `nuxt-schema-org` | Sitemap, robots, datos estructurados | 💡 Submódulos sueltos, no el paquete completo.                                          |
| `nuxt-turnstile`                                         | Antispam                             | 💡 ⚠️ Compatibilidad con Nuxt 4 no confirmada. Plan B: integración manual (~40 líneas). |
| SDK del proveedor de correo (`resend` o Brevo)           | Correo transaccional                 | ⚠️ Lo elige la clínica.                                                                 |

### 2.3. Herramientas fuera del bundle (pipeline 3D y QA)

| Herramienta                  | Uso                                                                                 | Licencia                                      | Estado                                                                     |
| ---------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------- |
| **Blender 5.2 LTS**          | Inspección, preparación y generación de modelos con Python (`bpy`) en modo headless | GPL (los modelos generados no heredan la GPL) | 🔒 Instalar. Detalle en [3d-pipeline.md](3d-pipeline.md).                  |
| `@gltf-transform/cli`        | Optimizar GLB (dedupe, weld, simplify, meshopt, texturas WebP)                      | MIT                                           | 🔒 devDependency.                                                          |
| Python con Pillow (opcional) | Muestrear colores e imágenes en scripts auxiliares                                  | —                                             | 💡 Opcional; Blender trae su propio Python.                                |
| KTX-Software (`toktx`)       | Texturas KTX2                                                                       | Apache 2.0                                    | 💡 Solo si hay texturas pesadas; con materiales sin textura no hace falta. |
| Playwright                   | Capturas responsive y E2E                                                           | Apache 2.0                                    | ⚠️ Fuera del stack declarado; requiere aprobación.                         |

### 2.4. Descartado

🔒 Lenis, Nuxt Content, Pinia, Supabase/BD, bibliotecas de componentes UI, analítica (en v1), **IA generativa 3D para anatomía**, **Google Places API para reseñas** (ver §9.4).

---

## 3. Información pública de la clínica (investigada)

### 3.1. Ficha de Google Maps "VALDEPODO Clínica de podología"

Consultada el 10/11/2026. ⚠️ Todo debe confirmarlo la clínica antes de publicarse: la ficha la puede editar cualquiera.

| Dato        | Valor en la ficha                                                           | Uso previsto                                                   |
| ----------- | --------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Nombre      | VALDEPODO Clínica de podología                                              | Marca. Coincide con el logo.                                   |
| Categoría   | Podólogo                                                                    | Schema.org (`Podiatrist`/`MedicalClinic`).                     |
| Dirección   | Calle Dr. Barraquer, 7, 28342 Valdemoro, Madrid                             | Footer, contacto, schema.                                      |
| Coordenadas | 40.1922932, -3.6762537 (Plus Code 58RF+WF)                                  | Mapa y "Cómo llegar".                                          |
| Teléfono    | 687 50 69 27                                                                | `tel:+34687506927`.                                            |
| Horario     | Lunes a viernes 10:00–13:30 y 16:30–20:00 · sábado y domingo cerrado        | Contacto, schema `openingHoursSpecification`.                  |
| Web         | Ninguna en la ficha                                                         | El nuevo dominio deberá añadirse a la ficha (SEO local).       |
| Valoración  | 4,7 sobre 5 (58 opiniones; Google indica "No se verificaron las opiniones") | Ver §9.4.                                                      |
| Fotos       | 6 en la ficha                                                               | ⚠️ No se sabe cuáles subió la clínica y cuáles otros usuarios. |

### 3.2. Pistas que hay que validar (no se publican sin confirmar)

- Las reseñas públicas mencionan por nombre de pila a profesionales y personal ("Paula", "Marta" para quiropodia, "Ana" en recepción). **No se deduce de ahí el equipo**: nombres, apellidos y cargos los facilita la clínica.
- Varias publicaciones de la cuenta de Instagram `@valdepodo`, visibles sin sesión, llevan la marca **"Podología Marta García"**. ⚠️ Hay que preguntar si es una marca anterior, asociada o una profesional del equipo, porque afecta al naming, al SEO y a la sección de trayectoria ("9 años").
- Un directorio de servicios sanitarios de Valdemoro lista "VALDEPODO" como clínica de podología.
- Perfil de LinkedIn facilitado: `paula-vigara-aranda-569223253`. Su contenido no se pudo leer (requiere sesión).

### 3.3. Redes sociales: acceso y uso de fotos

| Fuente                                  | Resultado                                                                             | Implicación               |
| --------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------- |
| Instagram (post `DFuxL5lA2Lf` y perfil) | Muro de inicio de sesión: solo se ve la cuadrícula parcial. No se ha iniciado sesión. | No se han extraído fotos. |
| LinkedIn empresa y persona              | Bloqueado sin sesión (403/999).                                                       | No se han extraído datos. |

Política de fotos:

- 💡 **Pedir a la clínica los originales.** Los de Instagram están comprimidos (~1080 px) y recortados, por debajo de la calidad necesaria para héroes y mosaicos.
- ⚠️ Si se usan imágenes de las redes de la clínica:
  - la clínica confirma que son suyas (no de un fotógrafo con derechos reservados, ni subidas por terceros);
  - en retratos, cada profesional da su consentimiento expreso para aparecer en la web (derecho a la propia imagen);
  - en imágenes con pacientes, debe constar el consentimiento del paciente.
- Si la clínica prefiere que las descarguemos de Instagram: puede exportarlas desde su cuenta, o iniciar sesión ella misma en el navegador del entorno de trabajo. **No usaremos credenciales de la clínica.**

---

## 4. Recursos existentes

| Recurso                                                                                                                                         | Estado                                                                   | Uso                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Logo raster (Google)                                                                                                                            | Disponible                                                               | Propuesta visual y muestreo de color. **No apto para producción ni para la animación de carga** (pérdida y bordes suavizados). |
| `../research/*`                                                                                                                                 | Referencias de terceros (stock con marca de agua, fabricantes, Dribbble) | Solo inspiración. **No reutilizables.**                                                                                        |
| Imágenes adjuntas en la conversación (tarjeta Framify, boceto de plantilla, infografía de plantilla infantil de un fabricante, mapa de presión) | Referencias de terceros                                                  | Solo inspiración. Las capas de la infografía son de un producto comercial: **no se usan** como capas de Valdepodo.             |
| `research.txt`                                                                                                                                  | Notas propias                                                            | Base de tono y frases de marca.                                                                                                |
| Código reutilizable                                                                                                                             | Ninguno                                                                  | Los componentes se definen en [02-plan.md](02-plan.md).                                                                        |

---

## 5. Estrategia definitiva de recursos 3D

Tres elementos **independientes**: cada uno puede avanzar, fallar o sustituirse sin bloquear a los demás.

### 5.A. Pie anatómico (Home)

**Objetivo visual:** pie anatómico reconocible con estética tecnológica: azul, cian, translúcido y luminoso.

#### Decisiones

- 🔒 **Fuente de geometría: atlas anatómicos abiertos derivados de datos reales.** No se usa IA generativa (genera superficies sin estructuras internas fiables) ni se modela anatomía "a ojo".
- 🔒 **Herramientas:** Blender 5.2 LTS + Python (`bpy`) en modo headless. **Claude escribe los scripts** de inspección, extracción, limpieza y exportación, y revisa los renders de validación que generan.
- 🔒 **Salida:** GLB optimizado con meshopt para TresJS/Three.js.
- 🔒 **Capas = las que existan en la fuente.** Objetivo: huesos, músculos, tendones, ligamentos y estructura exterior. **No se inventa ninguna estructura.** Si una capa no está disponible o no tiene calidad suficiente, se omite de la interfaz y se informa.

#### Fuentes candidatas (verificadas el 10/11/2026)

| Fuente                                                          | Licencia actual                                                                                                                                                                    | Atribución exigida                                                                                                                                                                                       | Contenido del pie                                                                                                                                                                             | Formato                                                                                                           | Observaciones                                                                                                                                                                                                                            |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BodyParts3D 4.0** (DBCLS)                                     | **CC BY 4.0** (página de licencia actualizada el 27/02/2025). Sin restricción comercial en el texto. Los usos no cubiertos por la licencia requieren contactar con el licenciante. | "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International"                                                                                                    | ⚠️ No documentado en las páginas consultadas. Las partes se identifican por **FMA ID** (Foundational Model of Anatomy).                                                                       | OBJ (paquetes `isa_BP3D_4.0_obj_99.zip` 136 MB, `partof_BP3D_4.0_obj_99.zip` 62 MB)                               | **Sin share-alike**: la opción legalmente más limpia. Malla en bruto que requiere limpieza.                                                                                                                                              |
| **Z-Anatomy**                                                   | **CC BY-SA 4.0**                                                                                                                                                                   | "BodyParts3D – DBCLS – CC-BY-SA 2.1 Japan" (texto antiguo que conservan en su README) + "Z-Anatomy – The libre 3D atlas of anatomy – CC-BY-SA 4.0" + definiciones de Wikipedia CC BY-SA 3.0 (si se usan) | ⚠️ No documentado. Sistemas en capas derivados de BodyParts3D; incluye un `TA2.csv` (posible mapeo a Terminologia Anatomica, sin verificar). Hay además un `Z-Biomechanics.7z` sin describir. | Plantilla de aplicación de Blender (`Z-Anatomy.zip`); también `.blend` en Google Drive y FBX en el repo de LluisV | **Share-alike sobre el modelo derivado.** Contiene modelos de terceros con licencia **NC** (oído interno CC BY-NC-SA, riñón CC BY-NC) que **no deben entrar en el GLB**. El repo de modelos se actualiza a diario de forma automatizada. |
| Marketplaces (CGTrader, TurboSquid, RenderHub, Sketchfab Store) | Varía por listado                                                                                                                                                                  | —                                                                                                                                                                                                        | Variable; ningún listado confirma por escrito todas las capas separadas en GLB                                                                                                                | GLB/FBX/OBJ/BLEND                                                                                                 | 💡 **Plan B**, solo con licencia que permita servir el GLB en una web y con capturas del outliner antes de comprar.                                                                                                                      |
| IA generativa 3D (Meshy, Tripo, Rodin, TRELLIS, Hunyuan3D)      | Varía; Hunyuan3D excluye la UE                                                                                                                                                     | —                                                                                                                                                                                                        | No genera estructuras internas                                                                                                                                                                | GLB                                                                                                               | 🔒 **Descartada** para anatomía.                                                                                                                                                                                                         |

**Implicaciones legales** (⚠️ interpretación técnica, no asesoramiento jurídico):

- **Solo BodyParts3D 4.0:** basta con la atribución. El GLB derivado puede llevar la licencia que se decida, siempre que se respete la atribución.
- **Geometría tomada de Z-Anatomy:** el GLB derivado debe publicarse bajo **CC BY-SA 4.0**, con atribución. No afecta al código de la web ni al resto de recursos, porque son obras independientes.
- **En los dos casos:** atribución visible en `/creditos` y en un pie discreto de la sección del hero, y un registro de procedencia en `public/models/CREDITS.md`.

#### Gate de viabilidad (Fase 2 del plan)

1. Descargar BodyParts3D 4.0 y Z-Anatomy, y **listar con un script** los objetos del pie y tobillo: nombre, FMA/TA, nº de triángulos, si es cerrado (_manifold_) y estado de las normales.
2. Confirmar qué capas existen realmente. **Ligamentos y piel del pie son los más dudosos.**
3. Renders de validación por capa (vistas lateral, medial, plantar y dorsal) → **revisión de la podóloga**.
4. Medir el peso tras la optimización frente al presupuesto (≤ 2,5 MB full / ≤ 1 MB lite).
5. Decidir:
   - **✅ viable:** se usan las capas disponibles;
   - **🟡 parcial:** exterior + huesos (y lo que se valide);
   - **❌ no viable:** plan B de pago o encargo, con presupuesto aprobado.

**Envolvente exterior:** si ninguna fuente tiene piel del pie utilizable, opción ⚠️: generar una envolvente **a partir de la propia geometría anatómica** (remallado por vóxeles + suavizado del conjunto hueso/músculo en Blender). Se presenta como "silueta exterior simplificada", no como piel anatómica, y solo se usa si la podóloga la acepta visualmente.

### 5.B. Estudio biomecánico

- 🔒 **Sin modelo 3D externo.** SVG + CSS + GSAP con recursos gráficos propios:

| Recurso                                                   | Técnica                                                                                                                                         |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Huellas plantares (izquierda/derecha, contorno y relleno) | SVG dibujado una vez y reutilizado con transformaciones.                                                                                        |
| Mapas de presión                                          | Gradientes radiales SVG con `feGaussianBlur`, recortados por la silueta (`clipPath`). Rampa de marca: azul profundo → azul → cian → azul hielo. |
| Puntos de apoyo                                           | Círculos SVG con pulso CSS.                                                                                                                     |
| Centro de presiones                                       | Trazo SVG animado (`stroke-dashoffset`) y punto que recorre la trayectoria.                                                                     |
| Líneas de progresión                                      | Paths SVG con GSAP.                                                                                                                             |
| Secuencias de apoyo en la marcha                          | Fases (contacto de talón → apoyo medio → despegue) como estados de datos interpolados con GSAP.                                                 |

- 💡 Three.js **solo como mejora opcional** (shader de mapa de presión en escritorio), con los mismos datos que la versión SVG y sin ser imprescindible. Si no aporta un valor visual claro, no se implementa.
- 🔒 Todas las visualizaciones se rotulan **"Visualización ilustrativa"** y no se presentan como mediciones clínicas. Sin cifras ni unidades que parezcan datos reales.
- Peso estimado: < 30 KB (SVG + JS de la sección).

### 5.C. Plantilla personalizada

- 🔒 **Geometría generada con Blender + Python a partir de parámetros** (`tools/blender/config/insole.json`):

| Parámetro                            | Descripción                                                           |
| ------------------------------------ | --------------------------------------------------------------------- |
| `length_mm`                          | Longitud total                                                        |
| `width_forefoot_mm`, `width_heel_mm` | Anchuras en antepié y talón                                           |
| `arch_height_mm`, `arch_peak`        | Altura y posición del arco longitudinal interno                       |
| `heel_cup_depth_mm`                  | Altura/profundidad de la copa de talón                                |
| `thickness_mm`                       | Espesor total (y por capa)                                            |
| `layers[]`                           | Capas conceptuales: `id`, `label`, `thickness_ratio`, `zone`, `color` |
| `side`, `seed`, `export`             | Lado, semilla (determinismo) y opciones de exportación                |

- 🔒 Capas en **objetos independientes** cuando proceda (`layer_<id>`), exportadas a GLB.
- 🔒 **Animación de fibras en Three.js con `InstancedMesh`** y shader propio, todo en GPU. Se muestrean puntos sobre la superficie de la plantilla (`MeshSurfaceSampler`) y un uniform `uProgress` controla las fases: dispersión → agrupación → superficie → volumen → plantilla.
- 🔒 **Representación conceptual.** Las capas se rotulan de forma genérica ("Capa superior", "Capa intermedia", "Base") **sin materiales, durezas, propiedades biomecánicas ni procesos de fabricación**, hasta que la clínica los confirme. Las fibras se presentan como **metáfora visual de construcción**, no como el proceso real.
- Peso estimado: GLB 150–500 KB; fibras sin assets (se generan en cliente).

### 5.D. Comparativa resumida

|                   | A. Pie                                                | B. Biomecánico          | C. Plantilla                      |
| ----------------- | ----------------------------------------------------- | ----------------------- | --------------------------------- |
| Fuente            | BodyParts3D 4.0 / Z-Anatomy                           | Propia (SVG)            | Propia (procedural)               |
| Licencia          | CC BY 4.0 / CC BY-SA 4.0                              | Propia                  | Propia                            |
| Calidad anatómica | Alta en huesos (datos reales); resto ⚠️ por verificar | No aplica (ilustrativo) | No aplica (conceptual)            |
| Formato           | GLB (meshopt)                                         | SVG inline              | GLB (meshopt) + shader            |
| Tamaño estimado   | 0,8–2,5 MB (lite ≤ 1 MB)                              | < 30 KB                 | 150–500 KB                        |
| Herramientas      | Blender 5.2, gltf-transform                           | —                       | Blender 5.2, gltf-transform       |
| Coste             | 0 € (plan B: 10–400 € o encargo)                      | 0 €                     | 0 €                               |
| Riesgo            | **Alto** (contenido real de la fuente)                | Bajo                    | Medio (estética de la superficie) |

---

## 6. Arquitectura del pipeline 3D

🔒 **Generación de recursos 3D separada de la aplicación Nuxt.** La app solo consume GLB e imágenes finales. Documentación completa en **[3d-pipeline.md](3d-pipeline.md)**.

```
tools/blender/                 # scripts Python (bpy), sin dependencias de la app
  ├─ inspect_source.py         # inventario de objetos de la fuente anatómica
  ├─ extract_foot.py           # extracción y limpieza del pie → capas
  ├─ build_insole.py           # plantilla paramétrica
  ├─ render_validation.py      # renders de validación y fallbacks
  └─ lib/                      # utilidades compartidas (materiales, cámara, export)
tools/blender/config/          # parámetros JSON (foot.json, insole.json, render.json)
tools/assets/                  # optimización (gltf-transform) y manifiesto
public/models/                 # GLB finales + CREDITS.md
public/images/3d-fallbacks/    # pósters AVIF/WebP por modelo, capa y estado
docs/3d-pipeline.md            # instalación, uso, versionado, licencias
```

Resumen de 3d-pipeline.md:

- **Dependencias:** Blender 5.2 LTS, Node + `@gltf-transform/cli`.
- **Instalación de Blender:** en Windows, versión portable o instalador desde blender.org; ruta en la variable `BLENDER_BIN`.
- **Automatización:** `blender -b --factory-startup -P script.py -- --config ...` desde scripts npm.
- **Exportación + optimización:** GLB sin compresión desde Blender, después `gltf-transform` (meshopt, weld, simplify).
- **Renders de validación:** imágenes en `tools/out/validation/`, que Claude revisa visualmente y se comparten con la podóloga.
- **Versionado:** fuentes pesadas fuera de git (URL + checksum en un manifiesto); scripts, configs, GLB y pósters dentro; versión semántica en un manifiesto.
- **Licencias:** `public/models/CREDITS.md` + página `/creditos`, con comprobación automática de que todo GLB tiene su entrada.

---

## 7. Rendimiento e integración

Se mantienen los criterios de la v1, ampliados:

| Criterio                                | Implementación                                                                                                                                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Carga diferida                          | El chunk de three/tres y el GLB se cargan después del LCP: IntersectionObserver a menos de 1 viewport y `requestIdleCallback`. Nunca en la carga inicial de la Home. 🔒                                            |
| Póster desde el SSR                     | `SceneGate` renderiza en el HTML inicial una imagen de `public/images/3d-fallbacks/` con las mismas dimensiones que el canvas (sin CLS). El canvas sustituye al póster con un fundido al primer frame. 🔒          |
| Fallback sin WebGL o con pocos recursos | `useDeviceTier()` → `full`/`lite`/`static`. En `static`: pósters por capa conmutables con los mismos controles. Ante `webglcontextlost` → póster. 🔒                                                               |
| Optimización de geometría               | Fusión de mallas no destacadas por capa; decimación por capa; weld; meshopt; presupuesto de triángulos y draw calls (spec 08). 🔒                                                                                  |
| Materiales y texturas                   | Materiales procedurales sin texturas siempre que sea posible (fresnel/rayos X en shader); si hay texturas, WebP o KTX2 ≤ 1K. 🔒                                                                                    |
| Complejidad en móvil                    | Variante `lite` del GLB (más decimada), `dpr ≤ 1.5`, sin `transmission`, menos fibras (1.500), sin pin. 🔒                                                                                                         |
| Scroll con GSAP sin bloquear            | `gsap.matchMedia()` por breakpoint y reduced motion; pin solo ≥ 1024 px y ≤ 300 % de viewport; `touch-action: pan-y` en canvas; nada de _scroll hijacking_. 🔒                                                     |
| Accesibilidad                           | Canvas `aria-hidden`; controles reales (botones con `aria-pressed`) para capas y hotspots; contenido equivalente en el DOM; rotación también por botones; `prefers-reduced-motion` → sin autorotación ni scrub. 🔒 |
| Recursos                                | Un solo `TresCanvas` por página, render bajo demanda, pausa fuera de viewport, `dispose()` al desmontar. 🔒                                                                                                        |
| Medición                                | `renderer.info` en dev, `nuxi analyze`, Lighthouse móvil en cada integración (Home ≥ 85). 🔒                                                                                                                       |

---

## 8. Identidad visual

### 8.1. Logotipo

- **Símbolo:** huella de pie con cinco dedos (óvalos) cuyo contorno forma un trazo caligráfico continuo. La parte superior es una curva azul en forma de "P" y la inferior un trazo cian que se cierra en lazo. Sugiere las iniciales y el movimiento de la pisada.
- **Wordmark:** "VALDEPODO" en sans geométrica de mayúsculas con tracking amplio, gris oscuro, y "Clínica de podología" debajo en caja baja.
- **Colores muestreados** del raster (cuantización a 4 niveles; ⚠️ aproximados hasta tener el vector):

| Elemento                  | HEX muestreado | Paleta propuesta en la especificación | Diferencia                                     |
| ------------------------- | -------------- | ------------------------------------- | ---------------------------------------------- |
| Trazo azul (talón/"P")    | **`#1070B4`**  | Azul principal `#087EAD`              | El logo es más saturado y más oscuro.          |
| Trazo cian (lazo y dedos) | **`#1CA8E0`**  | Cian `#00A9D0`                        | Muy próximo; el logo tira más a azul celeste.  |
| Wordmark                  | **`#545454`**  | Texto `#24364B`                       | El logo usa gris neutro; la web, azul pizarra. |

- ⚠️ **Decisión de color:** la especificación dice que prevalecen los colores reales de marca. 💡 Recomendación: **adoptar `#1070B4` como azul principal y `#1CA8E0` como cian** cuando el vector los confirme. Mientras tanto, la propuesta visual se construye con ellos y el resto de la paleta (azul profundo, hielo, superficies) se mantiene. Ventaja añadida: `#1070B4` da 5,25:1 sobre blanco frente al 4,57 de `#087EAD`, así que pasa a ser válido para texto pequeño.
- **Animación de carga:** el símbolo ya **es** una huella, así que la secuencia "huella → logo" encaja de forma natural: los dedos aparecen y el trazo se dibuja. 🔒 **Solo se implementa con el SVG original** o con una vectorización que la clínica apruebe expresamente.

#### Actualización (Fase 1): SVG recibido — `research/valdepodo_logo.svg`

| Aspecto    | Hallazgo                                                                                                                                                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Colores    | 🔒 **`#1270B6`** (huella: dedos + curva superior), **`#1EABE1`** (lazo inferior), **`#565656`** (wordmark). Confirman el muestreo del raster con desviaciones mínimas y pasan a ser los tokens de marca (`--color-primary`, `--color-cyan`, `--color-logo-gray`). |
| Contraste  | `#1270B6` sobre blanco: 5,23:1 ✅ texto normal. `#1EABE1` sobre blanco: 2,64:1 ❌ (la regla del cian se mantiene). `--color-primary-strong` = `#0B5E99` (6,83:1).                                                                                                 |
| Geometría  | ⚠️ **Es un calco automático (vectorización de un raster)**: todos los trazados son segmentos rectos (`L`) con coordenadas enteras, sin curvas Bézier. A tamaños grandes (hero, > 300 px) se aprecian facetas en los dedos y el lazo.                              |
| Contenido  | Contiene símbolo + "VALDEPODO". **No incluye** "Clínica de podología" (sí presente en el raster).                                                                                                                                                                 |
| Estructura | Tres grupos de formas **rellenas** (no trazos con `stroke`): la animación de carga no puede "dibujar" el trazo con `stroke-dashoffset` sobre estos paths; habría que usar máscaras/recortes progresivos.                                                          |
| Uso actual | `app/components/brand/BrandLogo.vue` (variantes `full`, `symbol`, `wordmark`, opción monocroma) y `public/favicon.svg`, con la geometría copiada literalmente, sin modificarla.                                                                                   |

💡 Recomendación: preguntar a la clínica si existe el **archivo original del diseñador** (AI/PDF/SVG con curvas). Si no existe, proponer un **redibujado fiel con curvas** (mismo diseño, sin facetas, idealmente con los trazos como `stroke` para animarlos), que la clínica tendría que aprobar antes de usarlo. Mientras tanto se usa este SVG en tamaños pequeños y medianos (navbar, footer, favicon), donde las facetas no se aprecian.

### 8.2. Contraste (WCAG 2.2), actualizado con los colores del logo

| Combinación                                | Ratio | Texto normal (4,5) | Grande / UI (3,0)    |
| ------------------------------------------ | ----- | ------------------ | -------------------- |
| Blanco sobre azul logo `#1070B4`           | 5,25  | ✅                 | ✅                   |
| `#1070B4` sobre `#F5F8FC`                  | 4,93  | ✅                 | ✅                   |
| `#1070B4` sobre `#EAF5FA`                  | 4,74  | ✅                 | ✅                   |
| Cian logo `#1CA8E0` sobre blanco           | 2,72  | ❌                 | ❌                   |
| Azul profundo `#163C63` sobre `#1CA8E0`    | 4,15  | ❌                 | ✅                   |
| Gris logo `#545454` sobre blanco           | 7,57  | ✅                 | ✅                   |
| Blanco sobre `#087EAD` (paleta v1)         | 4,57  | ✅ (justo)         | ✅                   |
| `#087EAD` sobre `#F5F8FC`                  | 4,29  | ❌                 | ✅                   |
| Cian `#00A9D0` sobre blanco                | 2,77  | ❌                 | ❌                   |
| Texto secundario `#617386` sobre `#EAF5FA` | 4,40  | ❌                 | ✅                   |
| Bordes `#DCE8EF` sobre blanco              | 1,25  | —                  | ❌ (solo decorativo) |

Tokens derivados (se mantienen de la v1):

- `--color-primary-strong #0A6E98`; si se adopta `#1070B4`, pasaría a `#0B5E99` (6,83:1);
- `--color-cyan-ink #007E9E`;
- `--color-text-secondary-strong #5A6C80`;
- `--color-border-strong #7A8FA3`.

🔒 **Regla:** el cian **nunca** se usa como texto sobre blanco ni como único portador de información.

### 8.3. Tipografía

Se mantiene la recomendación (💡 Instrument Serif + Manrope, alternativa DM Serif Display + DM Sans). ⚠️ El wordmark del logo es una sans geométrica de tracking amplio: los _eyebrows_ en mayúsculas con tracking 0,14em de la web dialogan con ella. Antes de cerrar se compara en la propuesta visual qué sans (Manrope o DM Sans) armoniza mejor con el wordmark. No se intentará imitar la tipografía del logo en el cuerpo de texto.

---

## 9. Servicios externos

Se mantiene lo de la v1, con estos ajustes.

- **9.1. Envío de solicitudes de cita.**
  - 🔒 `POST /api/cita` (Nitro), validación Zod compartida, antispam, dos correos (a la clínica y acuse "Hemos recibido tu solicitud", nunca "cita confirmada"), sin base de datos.
  - Implementado tras una interfaz `Mailer` y un adaptador `BookingSink`.
  - ⚠️ Proveedor: Resend o Brevo, a elegir por la clínica.
- **9.2. Antispam.** 🔒 Honeypot + tiempo mínimo firmado con HMAC + Turnstile + rate limit básico.
- **9.3. Mapa.** 🔒 Fachada estática con las coordenadas de la ficha (40.1922932, -3.6762537) y el iframe de Google Maps solo tras interacción. "Cómo llegar" con la URL de direcciones de Google.
- **9.4. Reseñas.**
  - Existen **reseñas reales** en Google (4,7 · 58), pero copiarlas plantea dos problemas: las condiciones de Google y los **datos personales de los autores** (nombre, texto).
  - 💡 Opción recomendada: la clínica selecciona reseñas y obtiene permiso de sus autores para publicarlas, con nombre de pila o iniciales; se guardan en `app/data/reviews.ts` con fuente y fecha, y se enlaza "Ver todas en Google".
  - ⚠️ La nota media (4,7) solo se muestra si la clínica lo desea, enlazada a la ficha y con fecha. **No se marca como `AggregateRating` propio** en schema.org.
  - 🔒 Sin Places API.
- **9.5. Agenda.** ⚠️ Sin información sobre software de agenda; se mantiene el adaptador para integrarla en el futuro.
- **9.6. Protección de datos.** ⚠️ El motivo "Pie diabético" puede revelar un dato de salud (art. 9 RGPD). Medidas:
  - opciones cerradas, sin texto libre de síntomas;
  - minimización de datos y sin almacenamiento;
  - casilla de privacidad obligatoria, separada de la de comunicaciones comerciales (opcional);
  - redacción de la cláusula y base jurídica a cargo de la asesoría de la clínica.

---

## 10. Riesgos

### 10.1. Técnicos

| Riesgo                                                                                | Prob.               | Impacto | Mitigación                                                                                                                  |
| ------------------------------------------------------------------------------------- | ------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| La fuente anatómica no tiene ligamentos o piel del pie, o su malla es de baja calidad | **Alta**            | Alto    | Gate de viabilidad (§5.A); capas solo si existen; envolvente derivada con aprobación; plan B.                               |
| Mallas de BodyParts3D no cerradas, normales invertidas o solapes                      | Media               | Medio   | Limpieza automática en script (merge by distance, recalcular normales, remallado por vóxeles opcional) + validación visual. |
| Peso del GLB anatómico                                                                | Media               | Alto    | Fusión por capa, decimación, meshopt, variante `lite`, solo región pie-tobillo.                                             |
| Overdraw y ordenación de capas translúcidas                                           | Media               | Medio   | Shader fresnel en lugar de transparencia apilada; `renderOrder`; máximo 2 capas translúcidas visibles.                      |
| Rendimiento en móvil                                                                  | Media               | Alto    | Niveles de dispositivo, `dpr` limitado, render bajo demanda, sin pin en móvil.                                              |
| Errores de SSR o hidratación con WebGL                                                | Baja                | Medio   | `.client.vue` + póster SSR.                                                                                                 |
| Fugas de memoria entre páginas                                                        | Media               | Medio   | `dispose()`; un canvas por página; `renderer.info`.                                                                         |
| ScrollTrigger + transiciones de página + barra de iOS                                 | Media               | Medio   | `gsap.context().revert()`, `refresh()` en `page:finish` y `fonts.ready`, `ignoreMobileResize`, unidades `svh`.              |
| OrbitControls bloquea el scroll táctil                                                | Alta si no se trata | Alto    | `touch-action: pan-y`, rotación horizontal o por botones, sin zoom con rueda.                                               |
| Estética "procedural" pobre en la plantilla                                           | Media               | Medio   | Subdivisión + bevel en Blender; materiales cuidados; iterar con renders.                                                    |
| Cambios en Blender 5.x que rompan scripts (API `bpy`, parámetros del exportador glTF) | Baja                | Medio   | Fijar 5.2 LTS; parámetros del exportador verificados contra su API; `--factory-startup`.                                    |
| Repo Z-Anatomy con commits automáticos diarios                                        | Media               | Bajo    | Fijar commit/fecha y checksum de la fuente en el manifiesto.                                                                |

### 10.2. Legales

| Riesgo                                                                  | Mitigación                                                                                                                                       |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Share-alike de Z-Anatomy sobre el GLB                                   | Preferir geometría de BodyParts3D 4.0 (CC BY); si se usa Z-Anatomy, publicar el GLB como CC BY-SA 4.0 con atribución. ⚠️ Confirmar con asesoría. |
| Modelos NC dentro del paquete Z-Anatomy                                 | El script de extracción usa una lista explícita de estructuras del pie (allowlist); nunca exporta otros sistemas.                                |
| Atribución de BodyParts3D                                               | Texto exacto de la licencia actual en `/creditos` y `CREDITS.md`.                                                                                |
| Fotos de redes sin derechos claros o sin consentimiento de las personas | Originales facilitados por la clínica + consentimiento escrito de cada profesional; sin fotos de pacientes salvo consentimiento.                 |
| Reseñas de Google con nombres de terceros                               | Permiso del autor o iniciales; sin Places API; sin `AggregateRating` propio.                                                                     |
| Datos de salud en el formulario                                         | §9.6 + revisión de la asesoría.                                                                                                                  |
| Contenido médico                                                        | Todo `pending()` hasta validación profesional.                                                                                                   |
| Marca "Podología Marta García" en redes                                 | Aclarar con la clínica antes de publicar trayectoria o nombres.                                                                                  |
| Logo vectorizado sin aprobación                                         | No vectorizar ni animar sin el visto bueno de la clínica.                                                                                        |

---

## 11. Plan de desarrollo (reordenado)

Detalle completo en [02-plan.md](02-plan.md). Secuencia:

1. **Entorno y arquitectura:** scaffolding Nuxt 4, calidad, CI, Blender 5.2 + pipeline base, tokens iniciales con los colores del logo.
2. **Prototipo anatómico del pie y validación de calidad:** gate de viabilidad §5.A.
3. **Recursos gráficos del estudio biomecánico:** biblioteca SVG + secuencias GSAP en una página de laboratorio.
4. **Plantilla conceptual y animación de fibras.**
5. **Integración progresiva de las experiencias 3D en Nuxt** (`SceneGate`, niveles, fallbacks) + **propuesta visual de la Home** para validar la dirección artística.
6. **Resto de secciones de la web:** layout global, Home, servicios, Conócenos, pedir cita, contacto.
7. **Optimización, accesibilidad, SEO y pruebas.**
8. **Validación de contenidos con la podóloga y preparación para producción.**

---

## 12. Preguntas abiertas para la clínica

1. ¿Tenéis el **logo en vector** (SVG/AI/PDF) y colores oficiales? ¿Confirmáis `#1070B4` y `#1CA8E0` como azul y cian?
2. ¿Qué relación tiene **"Podología Marta García"** con Valdepodo? ¿Fecha de apertura de Valdepodo (para "9 años")?
3. ¿Quiénes forman el **equipo** que aparecerá en la web (nombre completo, cargo, nº de colegiada, especialidades, redes)? ¿Dan su consentimiento para publicar su imagen?
4. ¿Podéis enviarnos **originales** de las fotos de Instagram (clínica y equipo) y confirmar que son vuestras?
5. ¿Son correctos la dirección, el teléfono (687 50 69 27) y el horario de la ficha de Google? ¿Qué **email** y qué perfil de Instagram usar?
6. ¿Usáis software de agenda? ¿Qué buzón recibe las solicitudes? ¿Resend o Brevo?
7. ¿Qué pruebas incluye el estudio biomecánico (y cuáles son opcionales)?
8. ¿Queréis que las plantillas muestren más adelante capas y materiales reales? Si es así, ¿cuáles son?
9. ¿Qué estructuras del pie queréis destacar? ¿Quién revisa los renders anatómicos?
10. ¿Qué reseñas podemos publicar y con qué identificación?
11. ¿Quién redacta o revisa los textos legales?
12. ¿Hosting (Vercel o Netlify) y dominio?

---

## 13. RESUMEN

### 13.1. Decisiones técnicas definitivas 🔒

- Stack íntegro de `stack-tecnologico.md`: Nuxt 4, Vue 3, TS strict, Tailwind v4 (plugin Vite), GSAP + ScrollTrigger, Three.js + TresJS v5, vee-validate v5 + Zod, Vitest, ESLint + Prettier; sin Pinia ni base de datos.
- Prerender (SSG) de todas las páginas + función serverless `/api/cita`.
- **Pie anatómico:** geometría de atlas abiertos derivados de datos reales (BodyParts3D / Z-Anatomy), procesada con Blender 5.2 + Python (scripts de Claude), GLB con meshopt, capas solo si existen. Sin IA generativa ni estructuras inventadas.
- **Biomecánico:** SVG + CSS + GSAP, sin modelo externo; rotulado como ilustrativo.
- **Plantilla:** Blender + Python paramétrico → GLB por capas; fibras con `InstancedMesh` en Three.js; representación conceptual sin materiales ni procesos atribuidos.
- Pipeline 3D separado de la app (`tools/blender/`, `tools/blender/config/`, `public/models/`, `public/images/3d-fallbacks/`, `docs/3d-pipeline.md`).
- Carga diferida, póster SSR, niveles `full`/`lite`/`static`, un canvas por página, sin pin en móvil, `prefers-reduced-motion`.
- Solicitud de cita (no reserva) por correo, con antispam y sin almacenamiento.
- Contenido no confirmado marcado con `pending()`; el build de producción falla si queda alguno.
- Plan reordenado: viabilidad 3D antes del resto de la web.

### 13.2. Pendiente de validación ⚠️

- Contenido real del pie en BodyParts3D 4.0 y Z-Anatomy (ligamentos, tendones, piel) y aprobación anatómica de la podóloga.
- Fuente final del pie (BodyParts3D, Z-Anatomy o combinación) y aceptación de la licencia resultante (CC BY / CC BY-SA) por la clínica y su asesoría.
- Colores oficiales del logo (vector) y adopción de `#1070B4` / `#1CA8E0`.
- Combinación tipográfica (en la propuesta visual).
- Compatibilidad exacta: peer deps de `three` con TresJS v5, Zod 4 con vee-validate v5, `nuxt-turnstile` con Nuxt 4.
- Módulos Nuxt propuestos y Playwright.
- Proveedor de correo, buzón de destino y software de agenda.
- Datos públicos de la ficha de Google (dirección, teléfono, horario).
- Equipo, trayectoria y relación con "Podología Marta García".
- Base jurídica y textos legales del formulario.

### 13.3. Recursos que hay que instalar o descargar

| Recurso                                                                                                                   | Para qué                                    | Cuándo         |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------- |
| Blender 5.2 LTS (blender.org)                                                                                             | Pipeline 3D                                 | Fase 1         |
| `@gltf-transform/cli` (npm, dev)                                                                                          | Optimización GLB                            | Fase 1         |
| Nuxt 4 + dependencias del stack (npm)                                                                                     | App                                         | Fase 1         |
| **BodyParts3D 4.0** OBJ (`isa_BP3D_4.0_obj_99.zip` 136 MB y/o `partof_…` 62 MB), desde dbarchive.biosciencedbc.jp         | Fuente anatómica                            | Fase 2         |
| **Z-Anatomy** (`Z-Anatomy.zip` del repo Models-of-human-anatomy, o `.blend` del repo de LluisV), con commit/fecha fijados | Fuente anatómica alternativa/complementaria | Fase 2         |
| Fuentes tipográficas (vía `@nuxt/fonts`, licencia OFL)                                                                    | Tipografía                                  | Fase 1         |
| Opcional: Playwright, KTX-Software                                                                                        | QA / texturas                               | Si se aprueban |

> Las descargas de fuentes anatómicas (~200 MB) se harán en un directorio propio fuera del repo, con checksum registrado. Se pedirá confirmación antes de descargarlas.

### 13.4. Recursos que hay que conseguir de la clínica

1. **Logo vectorial** y colores oficiales.
2. **Fotos originales:** equipo (retratos), clínica (principal + secundarias + detalles), tratamientos si procede, con confirmación de derechos.
3. **Consentimientos de imagen** de cada profesional.
4. **Equipo:** nombres completos, cargos, titulaciones, nº de colegiada, especialidades, redes autorizadas.
5. **Confirmación de datos de contacto** (dirección, teléfono, horario) + **email** + perfil de Instagram oficial.
6. **Fecha de apertura** e hitos; aclaración sobre "Podología Marta García".
7. **Contenido clínico** validado de cada servicio (fases reales del estudio biomecánico, proceso de plantillas, infantil, pie diabético).
8. Opcional: capas y materiales reales de las plantillas.
9. **Reseñas** seleccionadas con permiso.
10. **Revisión anatómica** de los renders del pie.
11. Textos legales y datos del responsable del tratamiento; proveedor de correo, buzón, agenda, dominio y hosting.

### 13.5. Riesgos técnicos y legales principales

- **Técnicos:**
  - que la fuente anatómica no tenga todas las capas o tenga calidad insuficiente;
  - peso y rendimiento 3D en móvil;
  - conflicto entre ScrollTrigger, WebGL y transiciones de página;
  - ordenación de capas translúcidas;
  - acabado de la plantilla procedural.
- **Legales:**
  - share-alike de Z-Anatomy y modelos NC dentro de su paquete;
  - derechos y consentimientos de las fotos de redes;
  - datos personales en las reseñas;
  - datos de salud en el formulario;
  - contenido médico sin validar;
  - uso de una marca anterior en redes.

### 13.6. Próximos pasos concretos

1. Enviar a la clínica las preguntas del §12 y la lista del §13.4. Prioridad: **logo vectorial, fotos originales y consentimientos**.
2. Instalar Blender 5.2 LTS y `@gltf-transform/cli`; crear el esqueleto de `tools/blender/` según [3d-pipeline.md](3d-pipeline.md).
3. Scaffolding de Nuxt 4 (Fase 1) con tokens provisionales basados en los colores del logo.
4. Con tu confirmación, descargar BodyParts3D 4.0 y Z-Anatomy y ejecutar `inspect_source.py` → **informe de inventario del pie** (capas disponibles, triángulos, calidad, licencia de cada objeto).
5. Renders de validación por capa → revisión con la podóloga → decisión de viabilidad (Gate 2).

---

## Fuentes

- **Ficha de la clínica:** [Google Maps – VALDEPODO Clínica de podología](https://www.google.com/maps/place/VALDEPODO+Cl%C3%ADnica+de+podolog%C3%ADa/@40.1922932,-3.6762537,17z) · [Instagram @valdepodo](https://www.instagram.com/valdepodo/) · [Directorio de servicios sanitarios de Valdemoro (AEETS)](https://aeets.es/category/valdemoro-madrid/)
- **TresJS:** [Announcing Tres 5.0](https://tresjs.org/blog/tresjs-v5) · [@tresjs/nuxt 5.8.1](https://github.com/Tresjs/tres/releases/tag/%40tresjs/nuxt%405.8.1) · [Changelog módulo Nuxt](https://github.com/Tresjs/nuxt/blob/main/CHANGELOG.md)
- **Nuxt:** [Roadmap](https://nuxt.com/docs/3.x/community/roadmap) · [releases.sh/nuxt](https://releases.sh/nuxt/nuxt.md) · [Nuxt SEO releases](https://nuxtseo.com/releases.md)
- **GSAP:** [Webflow makes GSAP 100% free](https://webflow.com/blog/gsap-becomes-free) · [GSAP en GitHub](https://github.com/greensock/GSAP)
- **Tailwind v4 en Nuxt:** [nuxt-modules/tailwindcss#919](https://github.fontlos.workers.dev/nuxt-modules/tailwindcss/issues/919) · [Answer Overflow](https://www.answeroverflow.com/m/1379119468470337576)
- **vee-validate:** [Migración v4 → v5](https://vee-validate.logaretm.com/v5/guide/migration/) · [Integración Zod](https://vee-validate.logaretm.com/v4/integrations/zod-schema-validation/)
- **Anatomía 3D – licencias:**
  - [BodyParts3D – licencia actual (CC BY 4.0)](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html) · [BodyParts3D – descargas](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html) · [BodyParts3D README 2011 (licencia antigua)](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/20110915/README_e.html)
  - [Z-Anatomy Models-of-human-anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy) · [Z-Anatomy (LluisV)](https://github.com/LluisV/Z-Anatomy)
  - [Anatomography (Wikipedia)](https://en.wikipedia.org/wiki/Anatomography)
- **Anatomía 3D – plan B:** [RenderHub Foot Anatomy](https://www.renderhub.com/azulutak/foot-anatomy) · [Sketchfab Feet 3D Anatomy](https://sketchfab.com/3d-models/feet-3d-anatomy-cf3074f2a9a44b029f79c08d0b279b38) · [CGTrader Human leg anatomy](https://www.cgtrader.com/3d-models/various/various-models/human-leg-anatomy-model) · [TurboSquid skeletal foot](https://www.turbosquid.com/3d-model/skeletal-foot)
- **IA 3D:** [Comparativa generadores IA 3D 2026](https://app.cinevva.com/guides/ai-3d-model-generators) · [Tripo AI review](https://pasqualepillitteri.it/en/news/7811/tripo-ai-review-3d-model-generator)
- **Blender:** [Blender 5.2 LTS](https://www.blender.org/releases/5-2/) · [Proceso LTS](https://wiki.blender.org/wiki/Process/LTS) · [Khronos – conversor glTF con Blender](https://github.khronos.org/glTF-Tutorials/BlenderGltfConverter/) · [Export a GLB por línea de comandos](https://til.jakelazaroff.com/blender/export-a-blender-file-to-glb-from-the-command-line/)
- **Optimización GLB:** [@gltf-transform/cli](https://www.npmjs.com/package/@gltf-transform/cli) · [EXTMeshoptCompression](https://gltf-transform.dev/modules/extensions/classes/EXTMeshoptCompression) · [meshoptimizer gltfpack](https://github.com/flexcompute/meshoptimizer/blob/master/gltf/README.md)
- **Correo / antispam:** [Nuxt Turnstile](https://nuxt.com/modules/turnstile) · [nuxt-modules/turnstile](https://github.com/nuxt-modules/turnstile) · [Enviar correos con Nuxt](https://www.sequenzy.com/blog/send-emails-nuxt)
- **Reseñas Google:** [Google reviews API: qué está permitido](https://justreview.co/blog/google-reviews-api-what-is-allowed/) · [ProcessWire: Places reviews](https://processwire.com/talk/topic/27953-strategies-for-including-google-places-reviews)
- **Protección de datos:** [AEPD – Guía pacientes y usuarios de la Sanidad](https://www.aepd.es/guias/guia-pacientes-usuarios-sanidad.pdf) · [AEPD informe 2020-0098](https://www.aepd.es/documento/2020-0098.pdf) · [Legiscope – RGPD en clínicas](https://www.legiscope.com/blog/rgpd-clinicas-fisioterapia.html) · [Meetergo – RGPD y citas](https://meetergo.com/es/blog/que-es-el-rgpd)
