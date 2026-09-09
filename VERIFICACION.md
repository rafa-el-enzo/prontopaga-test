# Verificación end-to-end

Corrida contra el server real (`node dist/server.js` tras `npx tsc`, puerto 3000,
variables desde `.env`). El campo `fecha` de las respuestas de `/score` es
dinámico (`new Date().toISOString()`), por eso se omite en los ejemplos.

## Checklist del desafío

| # | Caso | Request | Esperado | Resultado |
|---|------|---------|----------|-----------|
| 1 | admin puede consultar cualquier RUT | `GET /score/11.111.111-1` con token de `admin` | 200 + score | **200** `{"rut":"11.111.111-1","score":41}` |
| 2 | user consulta su propio RUT | `GET /score/12.345.678-5` con token de `user1` | 200 + score | **200** `{"rut":"12.345.678-5","score":12}` |
| 2b | mismo RUT sin formato | `GET /score/12345678-5` con token de `user1` | 200 (normaliza) | **200** `{"rut":"12.345.678-5","score":12}` |
| 3 | user consulta RUT ajeno | `GET /score/11.111.111-1` con token de `user1` | 403 | **403** `{"error":"No autorizado para consultar este RUT"}` |
| 4 | sin token | `GET /score/11.111.111-1` sin header `Authorization` | 401 | **401** `{"error":"Token no proporcionado"}` |
| 5 | token inválido | `GET /score/11.111.111-1` con `Authorization: Bearer esto-no-es-un-jwt` | 401 | **401** `{"error":"Token inválido o expirado"}` |
| 5b | token expirado | token firmado con `expiresIn: -10` | 401 | **401** `{"error":"Token inválido o expirado"}` |

## Casos adicionales

| Caso | Request | Resultado |
|------|---------|-----------|
| Login OK (admin) | `POST /auth/login {"username":"admin","password":"admin123"}` | **200** `{"token":"<jwt>"}` |
| Login OK (user1) | `POST /auth/login {"username":"user1","password":"user123"}` | **200** `{"token":"<jwt>"}` (payload incluye `rut`) |
| Credenciales inválidas | `POST /auth/login {"username":"admin","password":"nope"}` | **401** `{"error":"Credenciales inválidas"}` |
| Body con campo extra | `POST /auth/login {"username":"admin","password":"admin123","x":1}` | **422** `{"error":"El body debe contener únicamente username y password como strings"}` |
| JSON mal formado | `POST /auth/login` con `{"username":` | **400** `{"error":"Unexpected end of JSON input"}` |
| RUT con DV inválido | `GET /score/12.345.678-9` con token de `admin` | **400** `{"error":"RUT inválido"}` |
| Ruta inexistente | `GET /nope` | **404** `{"error":"Ruta no encontrada"}` |

## Cómo reproducir

```bash
npm install
npx tsc && node dist/server.js      # o: npm run dev

# en otra terminal
TOKEN=$(curl -s -X POST localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

curl -s -w '\n%{http_code}\n' localhost:3000/score/11.111.111-1 \
  -H "Authorization: Bearer $TOKEN"
```

Usuarios mock (`src/services/auth.service.ts`):

| username | password | role  | rut          |
|----------|----------|-------|--------------|
| admin    | admin123 | admin | —            |
| user1    | user123  | user  | 12.345.678-5 |
