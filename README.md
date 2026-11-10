# Valdepodo — web

Nueva web de **Valdepodo, clínica de podología** (Valdemoro, Madrid).

Stack: Nuxt 4 · Vue 3 · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger · Three.js + TresJS · VeeValidate + Zod · Vitest.
La documentación completa (research, plan, specs y pipeline 3D) está en [`docs/`](docs/README.md).

## Requisitos

- Node.js ≥ 22 y npm
- (Pipeline 3D) Blender **5.2 LTS** — ver [`docs/3d-pipeline.md`](docs/3d-pipeline.md) §4

## Puesta en marcha

```bash
npm install
cp .env.example .env   # completar cuando haga falta
npm run dev            # http://localhost:3000
```

| Script                              | Qué hace                                                               |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `npm run dev`                       | Servidor de desarrollo                                                 |
| `npm run build` / `npm run preview` | Build de producción (prerender) y previsualización                     |
| `npm run lint` / `npm run format`   | ESLint / Prettier                                                      |
| `npm run typecheck`                 | Comprobación de tipos (vue-tsc)                                        |
| `npm test`                          | Vitest (proyectos `unit` y `nuxt`)                                     |
| `npm run 3d:check-env`              | Comprueba Blender 5.2 y el exportador glTF                             |
| `npm run 3d:smoke`                  | Prueba del pipeline 3D: Blender → GLB → meshopt → comprobación         |
| `npm run 3d:check`                  | Manifiesto, créditos y presupuestos de los modelos en `public/models/` |

## Laboratorio

`/_lab` reúne las experiencias 3D y gráficas en desarrollo. Está disponible en `npm run dev` y se excluye del build de producción (salvo con `NUXT_PUBLIC_ENABLE_LAB=true`).

## Estructura

```
app/        Aplicación Nuxt (páginas, componentes, composables, estilos)
shared/     Código compartido cliente/servidor (esquemas, tipos, utilidades)
server/     API de Nitro (formulario de cita, Fase 6)
public/     Estáticos: modelos GLB (+ CREDITS.md), imágenes, favicon
tools/      Pipeline 3D (Blender + gltf-transform), independiente de la app
tests/      Vitest
docs/       Research, plan, specs y pipeline 3D
```
