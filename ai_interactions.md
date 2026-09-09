# Registro de interacciones con IA

Este archivo documenta dónde y cómo se usó asistencia de IA en el proyecto.
Se organiza por feature/módulo lógico (no por archivo individual). Solo se
registran módulos con intervención real de IA.

---

## Esqueleto inicial del proyecto (estructura de `src/`)

- **Módulo/feature:** Estructura base del proyecto (config, middlewares, routes, controllers, services, utils, types)
- **Herramienta usada:** Claude Code CLI (Claude Sonnet)
- **Qué generó la IA:** Esqueleto de carpetas y archivos con imports básicos, firmas de función vacías y comentarios `TODO`, sin lógica de negocio.
- **Qué decidí/ajusté yo:** Definí la arquitectura en capas (routes → controllers → services) y la separación de `auth` y `authorize` como middlewares independientes.

---

## Tipado de `req.user` (`types/express.d.ts`)

- **Módulo/feature:** Tipado de req.user (types/express.d.ts)
- **Herramienta usada:** Claude Code CLI
- **Qué generó la IA:** Declaration merging sobre `Express.Request` para tipar `req.user` como `JwtPayload`.
- **Qué decidí/ajusté yo:** Elegí este enfoque (declaration merging global) sobre alternativas como una interfaz `AuthenticatedRequest` explícita, porque con pocos endpoints protegidos reduce fricción y es el patrón estándar en proyectos Express + TypeScript.

---

## Utilidades de RUT (`utils/rut.ts`)

- **Módulo/feature:** Validación y formato de RUT chileno (utils/rut.ts)
- **Herramienta usada:** Claude Code CLI
- **Qué generó la IA:** `cleanRut`, `isValidRut` (módulo 11), `formatRut` y `rutsAreEqual`, tipadas y sin dependencias externas, más una batería de pruebas de comportamiento.
- **Qué decidí/ajusté yo:** `cleanRut` también elimina espacios y normaliza a mayúsculas; `isValidRut` solo exige el mínimo del algoritmo (cuerpo numérico + DV), sin longitudes arbitrarias; casos borde acordados: RUT vacío → `isValidRut` false y `rutsAreEqual("","")` true; `formatRut` idempotente porque limpia antes de formatear.

---

## Cálculo de score (`services/score.service.ts`)

- **Módulo/feature:** Cálculo de score (services/score.service.ts)
- **Herramienta usada:** Claude (chat) + Claude Code CLI
- **Qué generó la IA:** Función de hash determinista con SHA-256 nativo de Node (`crypto.createHash`), tomando los primeros 8 caracteres hex del digest y aplicando módulo 101 para un score 0-100.
- **Qué decidí/ajusté yo:** Evalué 5 alternativas (suma de char codes, DJB2, CRC32, SHA-256, multiplicative hashing con primo) y elegí SHA-256 nativo: evita implementar hashing propio (menos bugs sutiles), sin dependencias externas y es la primitiva más defendible en fintech: preferir herramientas estándar y auditadas sobre soluciones caseras, incluso para lógica no crítica.
- **Nivel de revisión:** generado y aceptado tal cual.

---

## Corrección de tipos tras validación con `tsc`

- **Módulo/feature:** Corrección de tipos tras validación con tsc (types/index.ts, services/auth.service.ts, import de config/index.ts en app.ts)
- **Herramienta usada:** Claude Code CLI
- **Qué generó la IA:** Detectó 6 errores de compilación al correr `npx tsc --noEmit` tras escribir `auth.service.ts` y los reportó con la causa raíz de cada uno.
- **Qué decidí/ajusté yo:** Revisé cada error antes de aplicar el fix: confirmé que `User` necesitaba `username`/`password`/`rut` opcional (types/index.ts estaba incompleto respecto al diseño acordado), que `JwtPayload.rut` debía ser opcional para reflejar la regla de negocio (admin sin rut), apliqué un cast puntual en `jwt.sign()` por un problema conocido de tipado en `@types/jsonwebtoken` (`StringValue` vs `string`), y agregué el import de `./config` en `app.ts` para que las env vars carguen incluso en tests de integración aislados.
- **Nivel de revisión:** cada fix fue evaluado individualmente antes de aplicar, no aceptado en bloque.

---

## Fix de entorno — incompatibilidad de versión de TypeScript

- **Módulo/feature:** Fix de entorno — incompatibilidad de versión de TypeScript
- **Herramienta usada:** Diagnóstico propio (sin IA) a partir del stack trace
- **Qué pasó:** `npm install typescript` sin versión fijada instaló TypeScript 7.x (preview), incompatible con ts-node 10.9.2 — rompe en tiempo de arranque al intentar leer `tsconfig.json`.
- **Qué decidí/ajusté yo:** Fijar la versión a `typescript@^5.6.0` (última estable de la serie 5), compatible con el resto del toolchain (ts-node-dev).
- **Nivel de revisión:** N/A — no generado por IA.

---

## Middleware de autenticación (`middlewares/auth.ts`)

- **Módulo/feature:** Middleware de autenticación (middlewares/auth.ts)
- **Herramienta usada:** Claude (chat) + Claude Code CLI
- **Qué generó la IA:** Middleware que extrae el Bearer token del header `Authorization`, lo verifica con `jwt.verify`, adjunta el payload a `req.user` y responde 401 en cualquier caso de fallo de token (sin token, inválido, expirado); además 500 si `JWT_SECRET` no está configurado.
- **Qué decidí/ajusté yo:** Mantuve la distinción de status: 401 para fallos atribuibles al cliente (token ausente o no verificable) y 500 para `JWT_SECRET` faltante, por ser un error de configuración del servidor y no del request; no simplifiqué todo a 401. Código aceptado sin cambios; detecté aparte que `score.routes.ts` aún importaba el nombre viejo del esqueleto (`auth` en vez de `authenticate`) y lo reporté en lugar de modificar otros archivos sin avisar.
- **Nivel de revisión:** generado y aceptado tal cual (auth.ts sin cambios); ajuste pendiente en `score.routes.ts` por confirmar.

---

## Middleware de autorización (`middlewares/authorize.ts`)

- **Módulo/feature:** Middleware de autorización por rol/RUT (middlewares/authorize.ts)
- **Herramienta usada:** Claude (chat) + Claude Code CLI
- **Qué generó la IA:** Middleware que corre después de `authenticate`: admin accede a cualquier RUT; user solo al RUT de su token, comparado con `rutsAreEqual` (tolera diferencias de formato) y no con `===`. Chequeo defensivo de `req.user` ausente → 401; RUT no coincidente → 403.
- **Qué decidí/ajusté yo:** Acepté la lógica sin cambios. Al validar con `tsc` apareció un desajuste de Express 5: `req.params.rut` es `string | string[]` en `@types/express@5`. Elegí narrowing con `Array.isArray` (toma `[0]` si es array) en vez de un cast `as string`, para no silenciar el chequeo y mantener el estilo defensivo del archivo; descarté el cast porque ocultaría un `TypeError` si el valor llegara a ser array.
- **Nivel de revisión:** generado y revisado; un único ajuste (narrowing de `req.params.rut`) evaluado y aplicado tras confirmación. `npx tsc --noEmit` en verde.

---

## Controller y ruta de login (`controllers/auth.controller.ts`)

- **Módulo/feature:** Handler POST /auth/login (controllers/auth.controller.ts + routes/auth.routes.ts)
- **Herramienta usada:** Claude Code CLI
- **Qué generó la IA:** Handler que valida el body, verifica credenciales con `validateCredentials`, firma el JWT con `generateToken` y responde `{ token }`; wiring de `auth.routes.ts` (`POST /login`).
- **Qué decidí yo:** Validación estricta del body (solo `username`/`password` string, `trim` de username, rechazo de campos extra) → 422; credenciales inválidas → 401 con mensaje genérico; éxito → 200 `{ token }` sin datos de usuario; error inesperado vía `next(err)` al errorHandler central.
- **Nivel de revisión:** generado según decisiones tomadas; verificado con smoke test (9 casos de body y credenciales) y `tsc` en verde.

---

## Controller y ruta de score (`controllers/score.controller.ts`)

- **Módulo/feature:** Handler GET /score/:rut (controllers/score.controller.ts + routes/score.routes.ts)
- **Herramienta usada:** Claude Code CLI
- **Qué generó la IA:** Handler que valida el RUT del path con `isValidRut` y devuelve `getScoreData(rut)`; ruta encadenada `authenticate → authorize → getScore`.
- **Qué decidí yo:** El controller pre-valida el RUT y responde 400 `{ error: 'RUT inválido' }` (el throw del service queda como segunda barrera); middlewares inline en la ruta en ese orden; corregí el `rut` del mock `user1` a `12.345.678-5` (DV válido) en vez de relajar la validación del endpoint.
- **Nivel de revisión:** generado según decisiones; verificado con smoke test (RUT en 2 formatos, DV inválido, basura, determinismo) y `tsc` en verde.

---

## Error handler centralizado (`middlewares/errorHandler.ts`)

- **Módulo/feature:** Middleware de manejo de errores centralizado (middlewares/errorHandler.ts)
- **Herramienta usada:** Claude Code CLI
- **Qué generó la IA:** Handler de 4 parámetros que resuelve el status desde `err.status`/`err.statusCode` (4xx-5xx, si no 500), responde `{ error }` y loguea los 5xx.
- **Qué decidí yo:** No mapear por texto del mensaje (solo status explícito); 5xx → mensaje genérico fijo (nunca filtra internals, ni en dev), 4xx → `err.message`; `console.error` con method/path/stack solo para 5xx; guarda defensiva `res.headersSent` → `next(err)`.
- **Nivel de revisión:** generado según decisiones; verificado con smoke test (SyntaxError del body-parser, error interno, statusCode explícito, status fuera de rango, headersSent) y `tsc` en verde.
