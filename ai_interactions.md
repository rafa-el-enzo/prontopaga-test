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
