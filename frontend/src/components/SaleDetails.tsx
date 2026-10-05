import { ReceiptText } from 'lucide-react'
import type { Sale } from '../types'
import { formatDateTime, formatMoney, paymentMethodLabels } from '../utils/format'
import './SaleDetails.css'

export function SaleDetails({ sale, onShowReceipt }: { sale: Sale; onShowReceipt: () => void }) {
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
