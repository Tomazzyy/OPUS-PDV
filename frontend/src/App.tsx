import { useState } from 'react'
import { Header, type Page } from './components/Header'
import { useAuth } from './hooks/useAuth'
import { CheckoutPage } from './pages/CheckoutPage'
import { LoginPage } from './pages/LoginPage'
import { SaleLookupPage } from './pages/SaleLookupPage'
import './App.css'

function App() {
  const { user, checking, signIn, signOut } = useAuth()
  const [page, setPage] = useState<Page>('checkout')

  if (checking) {
    return null
  }

  if (!user) {
    return <LoginPage onLogin={signIn} />
  }

  return (
    <div className="app">
      <Header page={page} onNavigate={setPage} operatorName={user.name} onLogout={signOut} />
      <main className="app-content">{page === 'checkout' ? <CheckoutPage /> : <SaleLookupPage />}</main>
    </div>
  )
}

export default App
