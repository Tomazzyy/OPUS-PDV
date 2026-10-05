import { useState, type FormEvent } from 'react'
import { CircleAlert, ReceiptText, Search } from 'lucide-react'
import { DailySummaryCards } from '../components/DailySummaryCards'
import { SaleDetails } from '../components/SaleDetails'
import { SaleReceipt } from '../components/SaleReceipt'
import { useDailySales } from '../hooks/useDailySales'
import { ApiError, getSale } from '../services/api'
import type { Sale } from '../types'
import { formatMoney, formatTime, paymentMethodLabels, todayISODate } from '../utils/format'
import './SalesPage.css'

export function SalesPage() {
  const [date, setDate] = useState(todayISODate)
  const [number, setNumber] = useState('')
  const [sale, setSale] = useState<Sale | null>(null)
  const [loadingSale, setLoadingSale] = useState(false)
  const [saleError, setSaleError] = useState('')
  const [showReceipt, setShowReceipt] = useState(false)
  const daily = useDailySales(date)

  async function openSale(id: number) {
    setNumber(String(id))
    setLoadingSale(true)
    setSaleError('')
    setSale(null)

    try {
      setSale(await getSale(id))
    } catch (err) {
      setSaleError(
        err instanceof ApiError && err.status === 404 ? err.message : 'Não foi possível consultar a venda. Tente novamente.',
      )
    } finally {
      setLoadingSale(false)
    }
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    const id = Number(number)

    if (!Number.isInteger(id) || id <= 0) {
      setSaleError('Informe um número de venda válido.')
      setSale(null)
      return
    }

    openSale(id)
  }

  return (
    <div className="sales">
      <form className="sales-search card" onSubmit={handleSearch}>
        <div className="sales-search-field">
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
        <button type="submit" className="btn btn-primary btn-lg" disabled={loadingSale || !number}>
          {loadingSale ? 'Buscando...' : 'Consultar'}
        </button>
      </form>

      <section className="sales-day">
        <header className="sales-day-header">
          <h2>Fechamento do dia</h2>
          <input
            type="date"
            value={date}
            max={todayISODate()}
            onChange={(event) => event.target.value && setDate(event.target.value)}
            aria-label="Data das vendas"
          />
        </header>
        <DailySummaryCards summary={daily.summary} />
      </section>

      <div className="sales-content">
        <section className="sales-list card">
          <h2>Vendas da data</h2>

          {daily.error ? (
            <div className="sales-state">
              <CircleAlert size={24} className="sales-state-error" />
              <p>Não foi possível carregar as vendas.</p>
              <button className="btn btn-secondary" onClick={daily.retry}>
                Tente novamente
              </button>
            </div>
          ) : daily.loading && daily.sales.length === 0 ? (
            <div className="sales-state">
              <p>Carregando vendas...</p>
            </div>
          ) : daily.sales.length === 0 ? (
            <div className="sales-state">
              <ReceiptText size={24} />
              <p>Nenhuma venda nesta data.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Hora</th>
                  <th>Operador</th>
                  <th>Pagamento</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {daily.sales.map((item) => (
                  <tr
                    key={item.id}
                    className={sale?.id === item.id ? 'active' : ''}
                    onClick={() => openSale(item.id)}
                    tabIndex={0}
                    onKeyDown={(event) => event.key === 'Enter' && openSale(item.id)}
                  >
                    <td>{item.id}</td>
                    <td>{formatTime(item.created_at)}</td>
                    <td>{item.operator_name}</td>
                    <td>{paymentMethodLabels[item.payment_method]}</td>
                    <td>{formatMoney(item.total_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="sales-details card">
          {saleError ? (
            <div className="sales-state">
              <CircleAlert size={24} className="sales-state-error" />
              <p>{saleError}</p>
            </div>
          ) : loadingSale ? (
            <div className="sales-state">
              <p>Buscando venda...</p>
            </div>
          ) : sale ? (
            <SaleDetails sale={sale} onShowReceipt={() => setShowReceipt(true)} />
          ) : (
            <div className="sales-state">
              <ReceiptText size={24} />
              <p>Selecione uma venda da lista ou busque pelo número.</p>
            </div>
          )}
        </section>
      </div>

      {sale && showReceipt && <SaleReceipt sale={sale} onClose={() => setShowReceipt(false)} />}
    </div>
  )
}
