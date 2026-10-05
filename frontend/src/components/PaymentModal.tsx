import { useState, type FormEvent } from 'react'
import { Banknote, CircleAlert, CreditCard, Wallet } from 'lucide-react'
import type { CartItem } from '../hooks/useCart'
import { ApiError, createSale } from '../services/api'
import type { PaymentMethod, Sale } from '../types'
import { formatMoney, paymentMethodLabels } from '../utils/format'
import { Modal } from './Modal'
import { MoneyInput } from './MoneyInput'
import './PaymentModal.css'

type PaymentModalProps = {
  items: CartItem[]
  totalCents: number
  onClose: () => void
  onCompleted: (sale: Sale) => void
  onFailed: () => void
}

const paymentOptions: { method: PaymentMethod; icon: typeof Banknote }[] = [
  { method: 'cash', icon: Banknote },
  { method: 'credit', icon: CreditCard },
  { method: 'debit', icon: Wallet },
]

export function PaymentModal({ items, totalCents, onClose, onCompleted, onFailed }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [receivedCents, setReceivedCents] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const isCash = method === 'cash'
  const missingCents = totalCents - receivedCents
  const canConfirm = !submitting && (!isCash || missingCents <= 0)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!canConfirm) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const sale = await createSale({
        items: items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
        payment_method: method,
        amount_received_cents: isCash ? receivedCents : undefined,
      })
      onCompleted(sale)
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError('Ocorreu um erro inesperado.', 0))
      setSubmitting(false)
      onFailed()
    }
  }

  return (
    <Modal onClose={onClose} canClose={!submitting}>
      <form onSubmit={handleSubmit}>
        <h2 className="modal-title">Finalizar venda</h2>

        <div className="payment-total">
          <span>Total da venda</span>
          <strong>{formatMoney(totalCents)}</strong>
        </div>

        <span className="payment-label">Forma de pagamento</span>
        <div className="payment-methods">
          {paymentOptions.map(({ method: option, icon: Icon }) => (
            <button
              key={option}
              type="button"
              className={method === option ? 'selected' : ''}
              onClick={() => setMethod(option)}
              aria-pressed={method === option}
            >
              <Icon size={22} />
              {paymentMethodLabels[option]}
            </button>
          ))}
        </div>

        {isCash && (
          <div className="payment-cash">
            <label className="field">
              <span>Valor recebido</span>
              <MoneyInput className="payment-received" value={receivedCents} onChange={setReceivedCents} data-autofocus />
            </label>

            <div className="payment-suggestions">
              {cashSuggestions(totalCents).map((value) => (
                <button key={value} type="button" onClick={() => setReceivedCents(value)}>
                  {value === totalCents ? 'Valor exato' : formatMoney(value)}
                </button>
              ))}
            </div>

            {receivedCents > 0 && missingCents > 0 ? (
              <div className="payment-change is-missing">
                <span>Valor recebido insuficiente</span>
                <strong>Faltam {formatMoney(missingCents)}</strong>
              </div>
            ) : (
              <div className="payment-change">
                <span>Troco</span>
                <strong>{formatMoney(receivedCents > 0 ? -missingCents : 0)}</strong>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="payment-error" role="alert">
            <CircleAlert size={18} />
            <div>
              <strong>Não foi possível finalizar a venda.</strong>
              <p>{error.message}</p>
              {error.status === 422 && <p>O estoque pode ter sido alterado. Atualize o carrinho e tente novamente.</p>}
            </div>
          </div>
        )}

        <div className="payment-actions">
          <button type="button" className="btn btn-secondary btn-lg" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={!canConfirm}>
            {submitting ? 'Finalizando...' : 'Confirmar venda'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function cashSuggestions(totalCents: number) {
  const roundUp = (step: number) => Math.ceil(totalCents / step) * step
  const values = [totalCents, roundUp(500), roundUp(1000), roundUp(5000), roundUp(10000)]

  return [...new Set(values)].slice(0, 4)
}
