# prontopaga-backend

API REST (Node.js + TypeScript + Express) del desafío técnico de ProntoPaga.

- `POST /auth/login` — devuelve un JWT a partir de usuario y contraseña.
- `GET /score/:rut` — devuelve un score determinista (0-100) para un RUT. Requiere JWT.

Autorización de `/score/:rut`:

- **admin**: puede consultar cualquier RUT.
- **user**: solo puede consultar el RUT que viene en su token.

---

## Puesta en marcha

```bash
npm install
cp .env.example .env        # ajustar valores si hace falta
npm run dev                 # desarrollo (ts-node-dev, recarga en caliente)
```

Para producción:

```bash
npm run build               # compila a dist/
npm start                   # node dist/server.js
```

Variables de entorno (`.env`):

| Variable         | Ejemplo        | Notas                                   |
|------------------|----------------|-----------------------------------------|
| `PORT`           | `3000`         | opcional, default `3000`                |
| `JWT_SECRET`     | `clave-segura` | **obligatoria**, el server no arranca sin ella |
| `JWT_EXPIRES_IN` | `1h`           | opcional, default `1h`                  |

Usuarios mock (`src/services/auth.service.ts`):

| username | password   | role  | rut            |
|----------|------------|-------|----------------|
| `admin`  | `admin123` | admin | —              |
| `user1`  | `user123`  | user  | `12.345.678-5` |

---

## Endpoints

### `POST /auth/login`

Body JSON con **exactamente** `username` y `password` (strings). Cualquier otro
campo, un tipo distinto o un valor vacío → `422`.

| Status | Cuándo                                   | Body                          |
|--------|------------------------------------------|-------------------------------|
| `200`  | credenciales correctas                   | `{ "token": "<jwt>" }`        |
| `401`  | usuario o contraseña incorrectos         | `{ "error": "Credenciales inválidas" }` |
| `422`  | body mal formado                         | `{ "error": "<detalle>" }`    |

### `GET /score/:rut`

Header `Authorization: Bearer <token>`. El `:rut` acepta con o sin puntos/guión
(`12.345.678-5` o `12345678-5`).

| Status | Cuándo                                             | Body                                             |
|--------|---------------------------------------------------|-------------------------------------------------|
| `200`  | autorizado                                         | `{ "rut": "12.345.678-5", "score": 12, "fecha": "2026-09-09T02:18:08.371Z" }` |
| `400`  | el RUT no es válido (dígito verificador)           | `{ "error": "RUT inválido" }`                   |
| `401`  | falta el token, o es inválido/expirado             | `{ "error": "Token no proporcionado" }` / `{ "error": "Token inválido o expirado" }` |
| `403`  | un `user` pide un RUT distinto al de su token      | `{ "error": "No autorizado para consultar este RUT" }` |

---

## Ejemplos (curl)

Asumen el server en `http://localhost:3000`.

### 1. Login como admin

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'
```

```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

Guardar el token en una variable para los siguientes ejemplos:

```bash
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' \
  | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
```

### 2. admin consulta cualquier RUT → 200

```bash
curl -s -w '\nHTTP %{http_code}\n' \
  http://localhost:3000/score/11.111.111-1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

```json
{ "rut": "11.111.111-1", "score": 41, "fecha": "2026-09-09T02:18:08.274Z" }
HTTP 200
```

### 3. Login como user1

```bash
USER_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"user1","password":"user123"}' \
  | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
```

### 4. user1 consulta su propio RUT → 200

```bash
curl -s -w '\nHTTP %{http_code}\n' \
  http://localhost:3000/score/12.345.678-5 \
  -H "Authorization: Bearer $USER_TOKEN"
```

```json
{ "rut": "12.345.678-5", "score": 12, "fecha": "2026-09-09T02:18:08.371Z" }
HTTP 200
```

Funciona igual sin formato:

```bash
curl -s -w '\nHTTP %{http_code}\n' \
  http://localhost:3000/score/12345678-5 \
  -H "Authorization: Bearer $USER_TOKEN"
```

### 5. user1 consulta un RUT ajeno → 403

```bash
curl -s -w '\nHTTP %{http_code}\n' \
  http://localhost:3000/score/11.111.111-1 \
  -H "Authorization: Bearer $USER_TOKEN"
```

```json
{ "error": "No autorizado para consultar este RUT" }
HTTP 403
```

### 6. Sin token → 401

```bash
curl -s -w '\nHTTP %{http_code}\n' \
  http://localhost:3000/score/11.111.111-1
```

```json
{ "error": "Token no proporcionado" }
HTTP 401
```

### 7. Token inválido → 401

```bash
curl -s -w '\nHTTP %{http_code}\n' \
  http://localhost:3000/score/11.111.111-1 \
  -H "Authorization: Bearer esto-no-es-un-jwt"
```

```json
{ "error": "Token inválido o expirado" }
HTTP 401
```

---

## Tests

```bash
npm test
```

Suite de tests unitarios con el runner nativo de Node (`node:test`), sin
dependencias extra. Corre sobre `test/api.test.ts` vía `ts-node/register` y
cubre, con `req`/`res` mockeados (sin levantar servidor):

- `utils/rut`: `cleanRut`, `isValidRut` (DV numérico, K, 0, casos inválidos),
  `formatRut`, `rutsAreEqual`.
- `score.service`: determinismo y rango 0-100 de `calculateScore`, forma de
  `getScoreData` y su error con DV inválido.
- `auth.service`: `validateCredentials` y payload del JWT (con/sin `rut` según rol).
- `auth.controller`: matriz de validación estricta del body (422), 401 y 200.
- `score.controller`: 200, normalización del RUT, 400 por DV inválido, param array.
- `authenticate` / `authorize`: 401 sin token, 401 token inválido/expirado,
  500 sin `JWT_SECRET`, admin vs user, 403 por RUT ajeno.
- `errorHandler`: resolución de status, 5xx genérico, 4xx con `err.message`, `headersSent`.
