/**
 * Tests unitarios (node:test, sin dependencias externas).
 *
 *   npm test
 *
 * Cubren utilidades de RUT, servicios, controllers y middlewares con
 * `req`/`res` mockeados; no levantan un servidor HTTP.
 */
process.env.JWT_SECRET = 'test-secret-para-tests';
process.env.JWT_EXPIRES_IN = '1h';

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

import { cleanRut, isValidRut, formatRut, rutsAreEqual } from '../src/utils/rut';
import { calculateScore, getScoreData } from '../src/services/score.service';
import { validateCredentials, generateToken } from '../src/services/auth.service';
import { login } from '../src/controllers/auth.controller';
import { getScore } from '../src/controllers/score.controller';
import { authenticate } from '../src/middlewares/auth';
import { authorize } from '../src/middlewares/authorize';
import { errorHandler } from '../src/middlewares/errorHandler';
import type { JwtPayload } from '../src/types';

// --- helpers -----------------------------------------------------------------

interface MockRes {
  statusCode: number;
  body: unknown;
  headersSent: boolean;
  status: (code: number) => MockRes;
  json: (payload: unknown) => MockRes;
}

function mockRes(): MockRes {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    headersSent: false,
  } as MockRes;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    res.headersSent = true;
    return res;
  };
  return res;
}

const SECRET = process.env.JWT_SECRET as string;

// --- utils/rut -------------------------------------------------------------

describe('utils/rut', () => {
  describe('cleanRut', () => {
    test('quita puntos y guión y pasa a mayúsculas', () => {
      assert.equal(cleanRut('12.345.678-5'), '123456785');
      assert.equal(cleanRut('12345678-k'), '12345678K');
    });
    test('quita también espacios', () => {
      assert.equal(cleanRut('  12 345 678 - 5 '), '123456785');
    });
    test('string vacío queda vacío', () => {
      assert.equal(cleanRut(''), '');
    });
  });

  describe('isValidRut', () => {
    test('acepta DV numérico correcto, con y sin formato', () => {
      assert.equal(isValidRut('11.111.111-1'), true);
      assert.equal(isValidRut('12345678-5'), true);
    });
    test('acepta DV K en mayúscula o minúscula', () => {
      assert.equal(isValidRut('16.666.666-K'), true);
      assert.equal(isValidRut('16666666k'), true);
    });
    test('acepta DV 0', () => {
      assert.equal(isValidRut('11.111.117-0'), true);
    });
    test('rechaza DV incorrecto', () => {
      assert.equal(isValidRut('12.345.678-9'), false);
    });
    test('rechaza cuerpo no numérico, basura y cadenas muy cortas', () => {
      assert.equal(isValidRut('12A45678-5'), false);
      assert.equal(isValidRut('no-es-rut'), false);
      assert.equal(isValidRut(''), false);
      assert.equal(isValidRut('5'), false);
    });
  });

  describe('formatRut', () => {
    test('formatea un cuerpo limpio con puntos y guión', () => {
      assert.equal(formatRut('123456785'), '12.345.678-5');
      assert.equal(formatRut('16666666k'), '16.666.666-K');
    });
    test('es idempotente sobre un RUT ya formateado', () => {
      assert.equal(formatRut('12.345.678-5'), '12.345.678-5');
    });
  });

  describe('rutsAreEqual', () => {
    test('true si difieren solo en formato o mayúsculas', () => {
      assert.equal(rutsAreEqual('12.345.678-5', '12345678-5'), true);
      assert.equal(rutsAreEqual('16666666-k', '16.666.666-K'), true);
    });
    test('false si son RUTs distintos', () => {
      assert.equal(rutsAreEqual('11.111.111-1', '12.345.678-5'), false);
    });
  });
});

// --- score.service ------------------------------------------------------------

describe('score.service', () => {
  describe('calculateScore', () => {
    test('es determinista para el mismo RUT', () => {
      assert.equal(calculateScore('12.345.678-5'), calculateScore('12.345.678-5'));
    });
    test('ignora el formato del RUT de entrada', () => {
      assert.equal(calculateScore('12.345.678-5'), calculateScore('12345678-5'));
    });
    test('devuelve un entero en el rango 0-100', () => {
      for (const rut of ['11.111.111-1', '12.345.678-5', '16.666.666-K', '11.111.117-0']) {
        const s = calculateScore(rut);
        assert.ok(Number.isInteger(s), `no es entero: ${s}`);
        assert.ok(s >= 0 && s <= 100, `fuera de rango: ${s}`);
      }
    });
  });

  describe('getScoreData', () => {
    test('devuelve { rut, score, fecha } con el RUT formateado', () => {
      const data = getScoreData('12345678-5');
      assert.equal(data.rut, '12.345.678-5');
      assert.equal(data.score, calculateScore('12345678-5'));
      assert.ok(!Number.isNaN(Date.parse(data.fecha)), 'fecha no es ISO válida');
    });
    test('lanza "RUT inválido" si el DV no cuadra', () => {
      assert.throws(() => getScoreData('12.345.678-9'), /RUT inválido/);
    });
  });
});

// --- auth.service -----------------------------------------------------------

describe('auth.service', () => {
  describe('validateCredentials', () => {
    test('devuelve el admin con credenciales correctas', () => {
      assert.equal(validateCredentials('admin', 'admin123')?.role, 'admin');
    });
    test('devuelve user1 junto con su rut', () => {
      const u = validateCredentials('user1', 'user123');
      assert.equal(u?.role, 'user');
      assert.equal(u?.rut, '12.345.678-5');
    });
    test('null si la contraseña no coincide', () => {
      assert.equal(validateCredentials('admin', 'mala'), null);
    });
    test('null si el usuario no existe', () => {
      assert.equal(validateCredentials('nadie', 'x'), null);
    });
  });

  describe('generateToken', () => {
    test('el token de admin NO incluye rut en el payload', () => {
      const u = validateCredentials('admin', 'admin123')!;
      const payload = jwt.verify(generateToken(u), SECRET) as JwtPayload;
      assert.equal(payload.sub, u.id);
      assert.equal(payload.role, 'admin');
      assert.equal(payload.rut, undefined);
    });
    test('el token de user SÍ incluye rut en el payload', () => {
      const u = validateCredentials('user1', 'user123')!;
      const payload = jwt.verify(generateToken(u), SECRET) as JwtPayload;
      assert.equal(payload.role, 'user');
      assert.equal(payload.rut, '12.345.678-5');
    });
    test('el token lleva exp posterior a iat', () => {
      const decoded = jwt.decode(
        generateToken(validateCredentials('admin', 'admin123')!)
      ) as jwt.JwtPayload;
      assert.ok((decoded.exp ?? 0) > (decoded.iat ?? 0));
    });
    test('lanza si falta JWT_SECRET', () => {
      const saved = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      try {
        assert.throws(
          () => generateToken(validateCredentials('admin', 'admin123')!),
          /JWT_SECRET/
        );
      } finally {
        process.env.JWT_SECRET = saved;
      }
    });
  });
});

// --- auth.controller — POST /auth/login ------------------------------------

describe('auth.controller — POST /auth/login', () => {
  function run(body: unknown) {
    const res = mockRes();
    let nextErr: unknown = null;
    login({ body } as never, res as never, ((e?: unknown) => {
      nextErr = e ?? null;
    }) as never);
    return { res, nextErr };
  }

  test('200 y { token } con credenciales válidas', () => {
    const { res } = run({ username: 'admin', password: 'admin123' });
    assert.equal(res.statusCode, 200);
    assert.equal(typeof (res.body as { token?: unknown }).token, 'string');
  });
  test('aplica trim al username: "  admin  " también autentica', () => {
    assert.equal(run({ username: '  admin  ', password: 'admin123' }).res.statusCode, 200);
  });
  test('NO aplica trim al password: "admin123 " no autentica -> 401', () => {
    assert.equal(run({ username: 'admin', password: 'admin123 ' }).res.statusCode, 401);
  });
  test('401 { error: "Credenciales inválidas" } si la contraseña es incorrecta', () => {
    const { res } = run({ username: 'admin', password: 'nope' });
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { error: 'Credenciales inválidas' });
  });
  test('422 si falta un campo', () => {
    assert.equal(run({ username: 'admin' }).res.statusCode, 422);
  });
  test('422 si sobra un campo desconocido', () => {
    assert.equal(
      run({ username: 'admin', password: 'admin123', role: 'x' }).res.statusCode,
      422
    );
  });
  test('422 si un campo no es string', () => {
    assert.equal(run({ username: 'admin', password: 123 }).res.statusCode, 422);
  });
  test('422 si el username queda vacío tras el trim', () => {
    assert.equal(run({ username: '   ', password: 'admin123' }).res.statusCode, 422);
  });
  test('422 si el body es un array', () => {
    assert.equal(run(['admin', 'admin123']).res.statusCode, 422);
  });
  test('422 si el body es null', () => {
    assert.equal(run(null).res.statusCode, 422);
  });
  test('nunca llama next() en los caminos controlados', () => {
    assert.equal(run({ username: 'admin', password: 'admin123' }).nextErr, null);
    assert.equal(run({}).nextErr, null);
  });
});

// --- score.controller — GET /score/:rut ----------------------------------

describe('score.controller — GET /score/:rut', () => {
  function run(rut: unknown) {
    const res = mockRes();
    let nextErr: unknown = null;
    getScore({ params: { rut } } as never, res as never, ((e?: unknown) => {
      nextErr = e ?? null;
    }) as never);
    return { res, nextErr };
  }

  test('200 y { rut, score, fecha } con un RUT válido', () => {
    const { res } = run('12.345.678-5');
    assert.equal(res.statusCode, 200);
    assert.deepEqual(Object.keys(res.body as object).sort(), ['fecha', 'rut', 'score']);
    assert.equal((res.body as { rut: string }).rut, '12.345.678-5');
  });
  test('normaliza el RUT sin formato en la respuesta', () => {
    assert.equal((run('12345678-5').res.body as { rut: string }).rut, '12.345.678-5');
  });
  test('400 { error: "RUT inválido" } si el DV no cuadra', () => {
    const { res } = run('12.345.678-9');
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { error: 'RUT inválido' });
  });
  test('400 con basura en el path', () => {
    assert.equal(run('no-es-rut').res.statusCode, 400);
  });
  test('toma el primer valor si el param llega como array', () => {
    assert.equal(run(['12.345.678-5']).res.statusCode, 200);
  });
});

// --- middleware authenticate -------------------------------------------------

describe('middleware authenticate', () => {
  const validToken = () => jwt.sign({ sub: '1', role: 'admin' }, SECRET);

  function run(headers: Record<string, string | undefined>) {
    const req = { headers } as { headers: typeof headers; user?: JwtPayload };
    const res = mockRes();
    let nexted = false;
    authenticate(req as never, res as never, (() => {
      nexted = true;
    }) as never);
    return { req, res, nexted };
  }

  test('401 si no hay header Authorization', () => {
    const { res, nexted } = run({});
    assert.equal(res.statusCode, 401);
    assert.equal(nexted, false);
  });
  test('401 si el header no empieza con "Bearer "', () => {
    assert.equal(run({ authorization: 'Token abc' }).res.statusCode, 401);
  });
  test('401 { error: "Token inválido o expirado" } si el token no es un JWT', () => {
    const { res } = run({ authorization: 'Bearer no-es-jwt' });
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { error: 'Token inválido o expirado' });
  });
  test('401 si el token está expirado', () => {
    const expired = jwt.sign({ sub: '1', role: 'admin' }, SECRET, { expiresIn: -10 });
    assert.equal(run({ authorization: `Bearer ${expired}` }).res.statusCode, 401);
  });
  test('llama next() y setea req.user con un token válido', () => {
    const { req, res, nexted } = run({ authorization: `Bearer ${validToken()}` });
    assert.equal(nexted, true);
    assert.equal(res.statusCode, 0);
    assert.equal(req.user?.sub, '1');
    assert.equal(req.user?.role, 'admin');
  });
  test('500 si JWT_SECRET no está configurado', () => {
    const saved = process.env.JWT_SECRET;
    const token = jwt.sign({ sub: '1', role: 'admin' }, saved as string);
    delete process.env.JWT_SECRET;
    try {
      assert.equal(run({ authorization: `Bearer ${token}` }).res.statusCode, 500);
    } finally {
      process.env.JWT_SECRET = saved;
    }
  });
});

// --- middleware authorize --------------------------------------------------

describe('middleware authorize', () => {
  function run(user: unknown, rut: string) {
    const req = { user, params: { rut } };
    const res = mockRes();
    let nexted = false;
    authorize(req as never, res as never, (() => {
      nexted = true;
    }) as never);
    return { res, nexted };
  }

  test('401 si req.user no está presente (authenticate no corrió)', () => {
    const { res, nexted } = run(undefined, '12.345.678-5');
    assert.equal(res.statusCode, 401);
    assert.equal(nexted, false);
  });
  test('admin: next() para cualquier RUT', () => {
    assert.equal(run({ sub: '1', role: 'admin' }, '11.111.111-1').nexted, true);
  });
  test('user: next() si el RUT del path es el suyo, aunque cambie el formato', () => {
    assert.equal(
      run({ sub: '2', role: 'user', rut: '12.345.678-5' }, '12345678-5').nexted,
      true
    );
  });
  test('user: 403 si el RUT del path es de otra persona', () => {
    const { res, nexted } = run({ sub: '2', role: 'user', rut: '12.345.678-5' }, '11.111.111-1');
    assert.equal(res.statusCode, 403);
    assert.equal(nexted, false);
  });
  test('user: 403 si el token no trae rut', () => {
    assert.equal(run({ sub: '2', role: 'user' }, '12.345.678-5').res.statusCode, 403);
  });
});

// --- errorHandler --------------------------------------------------------

describe('errorHandler', () => {
  function run(err: unknown, headersSent = false) {
    const req = { method: 'GET', originalUrl: '/score/x' };
    const res = mockRes();
    res.headersSent = headersSent;
    let nexted = false;
    errorHandler(err as never, req as never, res as never, (() => {
      nexted = true;
    }) as never);
    return { res, nexted };
  }

  test('4xx: respeta err.status y devuelve err.message', () => {
    const { res } = run(Object.assign(new Error('body mal formado'), { status: 400 }));
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { error: 'body mal formado' });
  });
  test('4xx: acepta err.statusCode como alternativa', () => {
    assert.equal(run(Object.assign(new Error('x'), { statusCode: 403 })).res.statusCode, 403);
  });
  test('5xx: sin status -> 500 y mensaje genérico (no filtra internals)', (t) => {
    t.mock.method(console, 'error', () => {});
    const { res } = run(new Error('detalle interno que no debe filtrarse'));
    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, { error: 'Error interno del servidor' });
  });
  test('status fuera del rango 400-599 cae en 500', (t) => {
    t.mock.method(console, 'error', () => {});
    assert.equal(run(Object.assign(new Error('x'), { status: 999 })).res.statusCode, 500);
  });
  test('si headersSent ya es true, delega en next(err) y no responde', () => {
    const { res, nexted } = run(new Error('x'), true);
    assert.equal(nexted, true);
    assert.equal(res.statusCode, 0);
  });
});
