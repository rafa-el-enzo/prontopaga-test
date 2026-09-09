// Cliente mínimo del backend. En dev, BASE = '/api' lo resuelve el proxy
// de Vite (ver vite.config.ts). En build se puede fijar VITE_API_URL.
const BASE = import.meta.env.VITE_API_URL ?? '/api'

export interface ScoreResponse {
  rut: string
  score: number
  fecha: string
}

class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(res.status, (data as { error?: string }).error ?? res.statusText)
  }
  return data as T
}

export function login(username: string, password: string): Promise<{ token: string }> {
  return request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
}

export function getScore(rut: string, token: string): Promise<ScoreResponse> {
  return request(`/score/${encodeURIComponent(rut)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export { ApiError }
