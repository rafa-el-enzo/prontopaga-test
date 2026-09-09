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
- **Nivel de revisión:** generado y aceptado tal cual
