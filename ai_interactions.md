# Registro de interacciones con IA — proyecto completo

Resumen del impacto de la IA en todo el monorepo (`backend/` + `frontend/`).
Detalle módulo a módulo en [`backend/ai_interactions.md`](backend/ai_interactions.md)
y [`frontend/ai_interactions.md`](frontend/ai_interactions.md).

## Herramienta

- **Claude CLI (Claude Code), modelo Sonnet** (`claude-sonnet-5`). Todo el
  código asistido se escribió desde la terminal con `claude cli`.
- En 3 módulos del backend (score y los dos middlewares) hubo discusión previa
  de alternativas en Claude chat; la escritura final siempre fue vía CLI/Sonnet.
- Nada se aceptó sin revisar: cada módulo se validó con `tsc --noEmit` + smoke
  test o la suite `node:test` antes de commitear.

## Reparto del trabajo

- **Yo decidí:** arquitectura, contratos de la API, reglas de negocio, códigos
  HTTP, casos borde, alcance de cada módulo, estrategia de tests y layout del repo.
- **La IA generó:** el código dentro de esas decisiones (esqueletos, funciones,
  middlewares, controllers, wiring, tests, scripts de verificación) y el
  diagnóstico de errores de compilación.
- Los fixes de tipos se evaluaron uno a uno, no en bloque.

## Mis decisiones clave

- **Arquitectura:** backend en capas `routes → controllers → services`; `auth` y
  `authorize` como middlewares separados. Monorepo `backend/` + `frontend/` con
  `package.json` raíz orquestador (scripts `--prefix`, sin workspaces).
- **Score:** hash determinista con SHA-256 nativo de Node (mód. 101 → 0-100);
  descarté 4 alternativas caseras por preferir una primitiva estándar en fintech.
- **Autorización:** admin a cualquier RUT, user solo al suyo; comparación con
  `rutsAreEqual` (tolera formato), no `===`. `req.user` ausente → 401; RUT no
  coincidente → 403.
- **RUT:** `isValidRut` solo exige el mínimo del módulo 11 (cuerpo + DV); casos
  borde: vacío → inválido, `rutsAreEqual("","")` true, `formatRut` idempotente.
- **Códigos HTTP:** login con validación estricta del body → 422, credenciales
  malas → 401 genérico, éxito → 200 `{ token }`. `auth`: 401 para fallos del
  cliente, 500 solo si falta `JWT_SECRET`. `errorHandler` central: status solo
  desde `err.status`, 5xx → mensaje genérico fijo (nunca filtra internals). 404
  en JSON. `config` hace fail-fast si falta `JWT_SECRET`.
- **Tipado:** `req.user` por declaration merging global; narrowing con
  `Array.isArray` en `req.params.rut` (no `as string`); cast puntual en
  `jwt.sign()` por `@types/jsonwebtoken`.
- **Tests:** runner nativo `node:test` sin dependencias nuevas, fuera de `src/`;
  57 tests con `req`/`res` mockeados. Verificación end-to-end (12 casos `curl`)
  consolidada en el README.
- **Frontend:** SPA mínima sin router ni store; proxy `/api` de Vite para CORS
  en dev, `VITE_API_URL` para builds aparte.

## Impacto de la IA por módulo

### Backend

| Módulo | Rol de la IA |
|--------|--------------|
| Esqueleto de `src/` | Carpetas/archivos con firmas vacías y `TODO`; estructura definida por mí |
| `types/express.d.ts` | Declaration merging para `req.user`; enfoque elegido por mí |
| `utils/rut.ts` | `cleanRut`, `isValidRut`, `formatRut`, `rutsAreEqual` + pruebas; casos borde míos |
| `services/score.service.ts` | Hash SHA-256 → score; generado y aceptado tal cual |
| Fixes de tipos tras `tsc` | Detectó y explicó 6 errores con causa raíz; cada fix evaluado aparte |
| `middlewares/auth.ts` | Bearer token + `jwt.verify` + 401/500; aceptado sin cambios |
| `middlewares/authorize.ts` | Autorización rol/RUT; único ajuste: narrowing de `req.params.rut` |
| `controllers/auth.controller.ts` + ruta | Handler `POST /auth/login` + wiring; smoke test (9 casos) + `tsc` |
| `controllers/score.controller.ts` + ruta | `GET /score/:rut`, cadena `authenticate → authorize → getScore`; smoke test + `tsc` |
| `middlewares/errorHandler.ts` | Handler de 4 params, status desde `err.status`; smoke test (5 casos) |
| `app.ts` + `config/index.ts` | 404 JSON, fail-fast de `JWT_SECRET`; verificación end-to-end |
| Verificación + README | Script `curl` de 12 casos + doc de uso; ejecutado y revisado |
| `test/api.test.ts` | 57 tests `node:test`; según mis decisiones, todos en verde |
| Reubicación a `backend/` | `git mv` + `package.json` raíz; sin cambios de lógica |

### Frontend

| Módulo | Rol de la IA |
|--------|--------------|
| SPA Vite + React + TS | Scaffold `react-ts`, proxy `/api`, `src/api.ts` (`login`, `getScore`, `ApiError`), `src/App.tsx`, limpieza del template; `npm run build` en verde + prueba end-to-end por el proxy (200 RUT propio, 403 RUT ajeno) |
