import { useState } from 'react'
import { Header, type Page } from './components/Header'
import { useAuth } from './hooks/useAuth'
import { CheckoutPage } from './pages/CheckoutPage'
import { LoginPage } from './pages/LoginPage'
import { ProductsAdminPage } from './pages/ProductsAdminPage'
import { SalesPage } from './pages/SalesPage'
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

  const isAdmin = user.role === 'admin'

  return (
    <div className="app">
      <Header
        page={page}
        onNavigate={setPage}
        operatorName={user.name}
        isAdmin={isAdmin}
        onLogout={() => {
          setPage('checkout')
          signOut()
        }}
      />
      <main className="app-content">
        {page === 'checkout' && <CheckoutPage />}
        {page === 'sales' && <SalesPage />}
        {page === 'products' && isAdmin && <ProductsAdminPage />}
      </main>
    </div>
  )
}

export default App
