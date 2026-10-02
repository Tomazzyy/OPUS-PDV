import { useState, type FormEvent } from 'react'
import { CircleAlert, Store } from 'lucide-react'
import { ApiError } from '../services/api'
import './LoginPage.css'

type LoginPageProps = {
  onLogin: (email: string, password: string) => Promise<void>
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await onLogin(email, password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível entrar. Tente novamente.')
      setSubmitting(false)
    }
  }

  return (
    <div className="login">
      <form className="login-card card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <span className="login-logo">
            <Store size={22} />
          </span>
          <div>
            <h1>PDV 01</h1>
            <p>Entre para abrir o caixa</p>
          </div>
        </div>

        {error && (
          <div className="login-error" role="alert">
            <CircleAlert size={16} />
            {error}
          </div>
        )}

        <label className="field">
          <span>E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="operador@loja.com"
            autoComplete="username"
            autoFocus
            required
          />
        </label>

        <label className="field">
          <span>Senha</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
