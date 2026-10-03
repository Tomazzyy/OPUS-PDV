import { useEffect, useState, type FormEvent } from 'react'
import { CircleAlert, ReceiptText, Search } from 'lucide-react'
import { SaleReceipt } from '../components/SaleReceipt'
import { ApiError, getSale, getSales } from '../services/api'
import type { Sale, SaleSummary } from '../types'
import { formatDateTime, formatMoney, paymentMethodLabels } from '../utils/format'
import './SaleLookupPage.css'

export function SaleLookupPage() {
  const [number, setNumber] = useState('')
  const [sale, setSale] = useState<Sale | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showReceipt, setShowReceipt] = useState(false)
  const [recentSales, setRecentSales] = useState<SaleSummary[] | null>(null)
  const [recentError, setRecentError] = useState(false)

  useEffect(() => {
    getSales()
      .then(setRecentSales)
      .catch(() => setRecentError(true))
  }, [])

  async function lookup(id: number) {
    setNumber(String(id))
    setLoading(true)
    setError('')
    setSale(null)

    try {
      setSale(await getSale(id))
    } catch (err) {
      setError(err instanceof ApiError && err.status === 404 ? err.message : 'Não foi possível consultar a venda. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const id = Number(number)

    if (!Number.isInteger(id) || id <= 0) {
      setError('Informe um número de venda válido.')
      setSale(null)
      return
    }

    lookup(id)
  }

  return (
    <div className="lookup">
      <form className="lookup-search card" onSubmit={handleSubmit}>
        <div className="lookup-search-field">
          <Search size={20} />
          <input
            value={number}
            onChange={(event) => setNumber(event.target.value.replace(/\D/g, ''))}
            placeholder="Digite o número da venda..."
            inputMode="numeric"
            aria-label="Número da venda"
            autoFocus
          />
        </div>
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !number}>
          {loading ? 'Buscando...' : 'Consultar'}
        </button>
      </form>

      <div className="lookup-content">
        <section className="lookup-result card">
          {error && (
            <div className="lookup-state">
              <CircleAlert size={28} className="lookup-state-error" />
              <p>{error}</p>
            </div>
          )}

          {!error && loading && (
            <div className="lookup-state">
              <p>Buscando venda...</p>
            </div>
          )}

          {!error && !loading && !sale && (
            <div className="lookup-state">
              <ReceiptText size={28} />
              <p>Digite o número de uma venda ou escolha uma venda recente.</p>
            </div>
          )}

          {sale && <SaleDetails sale={sale} onShowReceipt={() => setShowReceipt(true)} />}
        </section>

        <aside className="lookup-recent card">
          <h2>Vendas recentes</h2>

          {recentError && <p className="lookup-recent-empty">Não foi possível carregar as vendas.</p>}
          {!recentError && recentSales === null && <p className="lookup-recent-empty">Carregando vendas...</p>}
          {recentSales?.length === 0 && <p className="lookup-recent-empty">Nenhuma venda registrada ainda.</p>}

          {recentSales && recentSales.length > 0 && (
            <ul>
              {recentSales.map((recent) => (
                <li key={recent.id}>
                  <button className={sale?.id === recent.id ? 'active' : ''} onClick={() => lookup(recent.id)}>
                    <span className="lookup-recent-number">Nº {recent.id}</span>
                    <span className="lookup-recent-meta">
                      {formatDateTime(recent.created_at)} · {paymentMethodLabels[recent.payment_method]}
                    </span>
                    <strong>{formatMoney(recent.total_cents)}</strong>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      {sale && showReceipt && <SaleReceipt sale={sale} onClose={() => setShowReceipt(false)} />}
    </div>
  )
}

function SaleDetails({ sale, onShowReceipt }: { sale: Sale; onShowReceipt: () => void }) {
  return (
    <>
      <header className="sale-details-header">
        <div>
          <h2>Venda nº {sale.id}</h2>
          <span>
            {formatDateTime(sale.created_at)} · Operador: {sale.operator_name}
          </span>
        </div>
        <span className="sale-details-status">Finalizada</span>
      </header>

      <table className="sale-details-items">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Qtd.</th>
            <th>Preço un.</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item) => (
            <tr key={item.id}>
              <td>
                {item.product_name}
                <small>Cód. {item.product_code}</small>
              </td>
              <td>{item.quantity}</td>
              <td>{formatMoney(item.unit_price_cents)}</td>
              <td>{formatMoney(item.subtotal_cents)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="sale-details-summary">
        <div>
          <dt>Forma de pagamento</dt>
          <dd>{paymentMethodLabels[sale.payment_method]}</dd>
        </div>
        {sale.amount_received_cents !== null && (
          <div>
            <dt>Valor recebido</dt>
            <dd>{formatMoney(sale.amount_received_cents)}</dd>
          </div>
        )}
        {sale.change_cents !== null && (
          <div>
            <dt>Troco</dt>
            <dd>{formatMoney(sale.change_cents)}</dd>
          </div>
        )}
        <div className="sale-details-total">
          <dt>Total</dt>
          <dd>{formatMoney(sale.total_cents)}</dd>
        </div>
      </dl>

      <button className="btn btn-secondary sale-details-receipt" onClick={onShowReceipt}>
        <ReceiptText size={16} />
        Ver comprovante
      </button>
    </>
  )
}
