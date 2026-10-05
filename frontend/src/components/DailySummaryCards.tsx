import { Banknote, CreditCard, TrendingUp, Wallet } from 'lucide-react'
import type { DailySummary, PaymentMethod } from '../types'
import { formatMoney, paymentMethodLabels } from '../utils/format'
import './DailySummaryCards.css'

const paymentIcons: Record<PaymentMethod, typeof Banknote> = {
  cash: Banknote,
  credit: CreditCard,
  debit: Wallet,
}

function salesLabel(count: number) {
  return count === 1 ? '1 venda' : `${count} vendas`
}

export function DailySummaryCards({ summary }: { summary: DailySummary | null }) {
  const methods = Object.keys(paymentMethodLabels) as PaymentMethod[]

  return (
    <div className="daily-summary">
      <div className="daily-summary-card is-main card">
        <span className="daily-summary-label">
          <TrendingUp size={16} />
          Total vendido
        </span>
        <strong>{summary ? formatMoney(summary.total_cents) : '—'}</strong>
        <span className="daily-summary-count">{summary ? salesLabel(summary.sales_count) : ' '}</span>
      </div>

      {methods.map((method) => {
        const Icon = paymentIcons[method]
        const totals = summary?.payment_methods[method]

        return (
          <div key={method} className="daily-summary-card card">
            <span className="daily-summary-label">
              <Icon size={16} />
              {paymentMethodLabels[method]}
            </span>
            <strong>{totals ? formatMoney(totals.total_cents) : '—'}</strong>
            <span className="daily-summary-count">{totals ? salesLabel(totals.sales_count) : ' '}</span>
          </div>
        )
      })}
    </div>
  )
}
