# Registro de interacciones con IA — frontend

Este archivo documenta dónde y cómo se usó asistencia de IA en el frontend.
Se organiza por feature/módulo lógico (no por archivo individual). Solo se
registran módulos con intervención real de IA.

---

## Scaffold e integración con la API (`frontend/`)

- **Módulo/feature:** SPA Vite + React + TypeScript que consume el backend
- **Herramienta usada:** Claude Code CLI
- **Qué generó la IA:** Scaffold `npm create vite` (plantilla `react-ts`); proxy `/api` → `http://localhost:3000` en `vite.config.ts`; cliente `src/api.ts` (`login`, `getScore`, clase `ApiError`); `src/App.tsx` con formulario de login y consulta de score; limpieza del template (assets y estilos demo, `index.css` mínimo, `index.html`).
- **Qué decidí yo:** SPA mínima que demuestra el flujo real (login → token en estado de React → consulta protegida); proxy de Vite para evitar CORS en dev, con `VITE_API_URL` para builds servidos aparte; sin router ni librería de estado (dos vistas, no hace falta); `ApiError` sin parameter properties por `erasableSyntaxOnly` del tsconfig de Vite.
- **Nivel de revisión:** generado y revisado; `npm run build` en verde y prueba end-to-end a través del proxy (200 con RUT propio, 403 con RUT ajeno).
