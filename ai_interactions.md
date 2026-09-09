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
