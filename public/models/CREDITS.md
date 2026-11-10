# Créditos y licencias de los modelos 3D

Cada modelo publicado en esta carpeta tiene aquí su procedencia y licencia (ver `docs/3d-pipeline.md` §10).
La comprobación `npm run 3d:check` falla si falta alguna sección.

<!-- credits:test-cube -->

## test-cube.glb

- **Uso:** modelo de prueba del pipeline (Fase 1). Solo se carga en `/_lab`, excluido del build de producción.
- **Origen:** generado por `tools/blender/test_cube.py` a partir de `tools/blender/config/test-cube.json`.
- **Licencia:** obra propia del proyecto Valdepodo.

<!-- credits:foot-proto -->

## foot-proto.full.glb · foot-proto.lite.glb

- **Uso:** prototipo anatómico del pie (Fase 2), en el hero de la Home desde la Fase 5 (marcado como provisional) y en `/_lab`, hasta que lo valide la podóloga.
- **Fuente:** BodyParts3D 4.0 — "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International" (https://dbarchive.biosciencedbc.jp/en/bodyparts3d/). SHA-256 del paquete descargado en `tools/assets/manifest.json`.
- **Modificaciones:** selección de las estructuras del pie y tobillo derechos, unión de vértices duplicados, recorte por encima del tobillo (tapas planas en el corte), cambio de orientación y escala, simplificación y compresión (meshopt) en la variante `lite`.
- **Licencia de este derivado:** CC BY 4.0, con la atribución anterior.

<!-- credits:insole -->

## insole.glb

- **Uso:** plantilla conceptual por capas (Fase 4), en `/servicios/plantillas-personalizadas` desde la Fase 5 y en `/_lab`.
- **Origen:** generada por `tools/blender/build_insole.py` a partir de `tools/blender/config/insole.json` (forma paramétrica, valores conceptuales). Las fibras no forman parte del modelo: se generan en el navegador.
- **Licencia:** obra propia del proyecto Valdepodo.
