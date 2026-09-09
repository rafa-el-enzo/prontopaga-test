import { useState } from 'react'
import { ApiError, getScore, login, type ScoreResponse } from './api'
import './App.css'

function App() {
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [rut, setRut] = useState('11.111.111-1')
  const [score, setScore] = useState<ScoreResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await login(username.trim(), password)
      setToken(res.token)
    } catch (err) {
      setError(err instanceof ApiError ? `${err.status} — ${err.message}` : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleScore(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setError(null)
    setScore(null)
    setLoading(true)
    try {
      setScore(await getScore(rut.trim(), token))
    } catch (err) {
      setError(err instanceof ApiError ? `${err.status} — ${err.message}` : String(err))
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    setToken(null)
    setScore(null)
    setError(null)
  }

  return (
    <main className="app">
      <h1>ProntoPaga — consulta de score</h1>

      {!token ? (
        <form onSubmit={handleLogin} className="card">
          <h2>Login</h2>
          <label>
            Usuario
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? '...' : 'Ingresar'}
          </button>
          <p className="hint">
            mock: <code>admin / admin123</code> · <code>user1 / user123</code>
          </p>
        </form>
      ) : (
        <>
          <form onSubmit={handleScore} className="card">
            <div className="row">
              <h2>Consultar score</h2>
              <button type="button" className="link" onClick={logout}>
                cerrar sesión
              </button>
            </div>
            <label>
              RUT
              <input value={rut} onChange={(e) => setRut(e.target.value)} />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? '...' : 'Consultar'}
            </button>
          </form>

          {score && (
            <div className="card result">
              <div>
                <span>RUT</span>
                <strong>{score.rut}</strong>
              </div>
              <div>
                <span>Score</span>
                <strong>{score.score}</strong>
              </div>
              <div>
                <span>Fecha</span>
                <strong>{new Date(score.fecha).toLocaleString()}</strong>
              </div>
            </div>
          )}
        </>
      )}

      {error && <p className="error">{error}</p>}
    </main>
  )
}

export default App
