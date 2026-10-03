import { CircleCheck } from 'lucide-react'
import type { Sale } from '../types'
import { formatDateTime, formatMoney, paymentMethodLabels } from '../utils/format'
import { Modal } from './Modal'
import './SaleSuccessModal.css'

type SaleSuccessModalProps = {
  sale: Sale
  onNewSale: () => void
}

export function SaleSuccessModal({ sale, onNewSale }: SaleSuccessModalProps) {
  return (
    <Modal onClose={onNewSale} className="sale-success">
      <div className="sale-success-header">
        <CircleCheck size={48} strokeWidth={1.75} />
        <h2>Venda finalizada</h2>
        <p>Venda nº {sale.id}</p>
      </div>

      <dl className="sale-success-details">
        <div>
          <dt>Data/hora</dt>
          <dd>{formatDateTime(sale.created_at)}</dd>
        </div>
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
        <div className="sale-success-total">
          <dt>Total</dt>
          <dd>{formatMoney(sale.total_cents)}</dd>
        </div>
        {sale.change_cents !== null && (
          <div className="sale-success-change">
            <dt>Troco</dt>
            <dd>{formatMoney(sale.change_cents)}</dd>
          </div>
        )}
      </dl>

      <button className="btn btn-primary btn-lg sale-success-action" onClick={onNewSale} data-autofocus>
        Nova venda
      </button>
    </Modal>
  )
}
