import { useEffect, useState } from 'react'
import { LogOut, Package, ReceiptText, ShoppingCart, Store, UserRound } from 'lucide-react'
import { formatDateTime } from '../utils/format'
import './Header.css'

export type Page = 'checkout' | 'sales' | 'products'

type HeaderProps = {
  page: Page
  onNavigate: (page: Page) => void
  operatorName: string
  isAdmin: boolean
  onLogout: () => void
}

export function Header({ page, onNavigate, operatorName, isAdmin, onLogout }: HeaderProps) {
  const now = useNow()

  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-logo">
          <Store size={18} />
        </span>
        <strong>PDV 01</strong>
        <span className="header-status">
          <span className="header-status-dot" />
          Caixa aberto
        </span>
      </div>

      <nav className="header-nav">
        <button className={page === 'checkout' ? 'active' : ''} onClick={() => onNavigate('checkout')}>
          <ShoppingCart size={16} />
          <span className="header-label">Caixa</span>
        </button>
        <button className={page === 'sales' ? 'active' : ''} onClick={() => onNavigate('sales')}>
          <ReceiptText size={16} />
          <span className="header-label">Vendas</span>
        </button>
        {isAdmin && (
          <button className={page === 'products' ? 'active' : ''} onClick={() => onNavigate('products')}>
            <Package size={16} />
            <span className="header-label">Produtos</span>
          </button>
        )}
      </nav>

      <div className="header-info">
        <span className="header-clock">{formatDateTime(now)}</span>
        <span className="header-operator" title={operatorName}>
          <UserRound size={16} />
          <span className="header-label">{operatorName}</span>
        </span>
        <button className="header-logout" onClick={onLogout} title="Sair">
          <LogOut size={16} />
          <span className="header-label">Sair</span>
        </button>
      </div>
    </header>
  )
}

function useNow() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return now
}
