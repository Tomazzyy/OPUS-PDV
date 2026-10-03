import { Printer } from 'lucide-react'
import type { Sale } from '../types'
import { formatDateTime, formatMoney, paymentMethodLabels } from '../utils/format'
import { Modal } from './Modal'
import './SaleReceipt.css'

type SaleReceiptProps = {
  sale: Sale
  onClose: () => void
}

export function SaleReceipt({ sale, onClose }: SaleReceiptProps) {
  return (
    <Modal onClose={onClose} className="receipt-modal">
      <article className="receipt">
        <header className="receipt-header">
          <strong>OpusPDV</strong>
          <span>PDV 01</span>
          <span>CUPOM NÃO FISCAL</span>
        </header>

        <div className="receipt-section">
          <div className="receipt-row">
            <span>Venda nº</span>
            <span>{String(sale.id).padStart(6, '0')}</span>
          </div>
          <div className="receipt-row">
            <span>Data/hora</span>
            <span>{formatDateTime(sale.created_at)}</span>
          </div>
          <div className="receipt-row">
            <span>Operador</span>
            <span>{sale.operator_name}</span>
          </div>
        </div>

        <ul className="receipt-section receipt-items">
          {sale.items.map((item) => (
            <li key={item.id}>
              <span className="receipt-item-name">{item.product_name}</span>
              <div className="receipt-row">
                <span>
                  {item.quantity} × {formatMoney(item.unit_price_cents)}
                </span>
                <span>{formatMoney(item.subtotal_cents)}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="receipt-section">
          <div className="receipt-row receipt-total">
            <span>TOTAL</span>
            <span>{formatMoney(sale.total_cents)}</span>
          </div>
          <div className="receipt-row">
            <span>Forma de pagamento</span>
            <span>{paymentMethodLabels[sale.payment_method]}</span>
          </div>
          {sale.amount_received_cents !== null && (
            <div className="receipt-row">
              <span>Valor recebido</span>
              <span>{formatMoney(sale.amount_received_cents)}</span>
            </div>
          )}
          {sale.change_cents !== null && (
            <div className="receipt-row">
              <span>Troco</span>
              <span>{formatMoney(sale.change_cents)}</span>
            </div>
          )}
        </div>

        <footer className="receipt-footer">Obrigado pela preferência!</footer>
      </article>

      <div className="receipt-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Fechar
        </button>
        <button className="btn btn-primary" onClick={() => window.print()} data-autofocus>
          <Printer size={16} />
          Imprimir
        </button>
      </div>
    </Modal>
  )
}
