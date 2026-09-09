# prontopaga-test

Desafío técnico ProntoPaga. Monorepo con dos frentes:

| Carpeta      | Qué es                          | Stack                              |
|--------------|---------------------------------|------------------------------------|
| `backend/`   | API REST (login JWT + score)    | Node + TypeScript + Express        |
| `frontend/`  | SPA que consume la API          | Vite + React + TypeScript          |

## Puesta en marcha

```bash
npm run install:all      # instala backend/ y frontend/
npm run dev              # API en :3000 y SPA en :5173, en paralelo
```

O cada lado por separado:

```bash
npm run dev:api          # solo el backend
npm run dev:web          # solo el frontend
```

En dev, la SPA llama a `/api/...` y Vite lo reenvía al backend
(`frontend/vite.config.ts`), así que no hay CORS de por medio. Para un build
servido aparte del backend, fijar `VITE_API_URL` (ver `frontend/.env.example`).

## Scripts (raíz)

| Script                | Efecto                                        |
|-----------------------|-----------------------------------------------|
| `npm run install:all` | `npm install` en ambos paquetes               |
| `npm run dev`         | backend + frontend en paralelo                |
| `npm run dev:api`     | solo backend (`ts-node-dev`, recarga)         |
| `npm run dev:web`     | solo frontend (`vite`)                        |
| `npm run build`       | build de ambos                                |
| `npm test`            | tests del backend (57, runner `node:test`)    |

Cada paquete conserva sus propios scripts; esto es solo una capa de conveniencia
(no usa workspaces, para no tocar las instalaciones existentes).

## Detalle por lado

- **`backend/README.md`** — endpoints, ejemplos `curl`, usuarios mock, cómo correr los tests.
- **Registro de uso de IA** — `backend/ai_interactions.md` y `frontend/ai_interactions.md` (uno por lado; más adelante habrá un resumen combinado en la raíz).

## Usuarios mock

| username | password   | role  | rut            |
|----------|------------|-------|----------------|
| `admin`  | `admin123` | admin | —              |
| `user1`  | `user123`  | user  | `12.345.678-5` |
