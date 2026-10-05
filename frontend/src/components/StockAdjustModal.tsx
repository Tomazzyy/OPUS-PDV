import { useState, type FormEvent } from 'react'
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { ApiError, adjustStock } from '../services/api'
import type { Product } from '../types'
import { Modal } from './Modal'
import './ProductModals.css'

type StockAdjustModalProps = {
  product: Product
  onClose: () => void
  onSaved: () => void
}

export function StockAdjustModal({ product, onClose, onSaved }: StockAdjustModalProps) {
  const [type, setType] = useState<'in' | 'out'>('in')
  const [quantity, setQuantity] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const amount = Number(quantity)
  const newStock = product.stock_quantity + (type === 'in' ? amount : -amount)
  const canSave = !saving && amount > 0 && newStock >= 0

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!canSave) {
      return
    }

    setSaving(true)
    setError('')

    try {
      await adjustStock(product.id, type === 'in' ? amount : -amount)
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? (err.errors.quantity?.[0] ?? err.message) : 'Não foi possível ajustar o estoque.')
      setSaving(false)
    }
  }

  return (
    <Modal onClose={onClose} canClose={!saving}>
      <form className="product-form" onSubmit={handleSubmit}>
        <h2 className="modal-title">Ajustar estoque</h2>
        <p className="stock-product">
          {product.name} <span>· Cód. {product.code}</span>
        </p>

        <div className="stock-types">
          <button type="button" className={type === 'in' ? 'selected' : ''} onClick={() => setType('in')}>
            <ArrowDownToLine size={18} />
            Entrada
          </button>
          <button type="button" className={type === 'out' ? 'selected' : ''} onClick={() => setType('out')}>
            <ArrowUpFromLine size={18} />
            Saída
          </button>
        </div>

        <label className="field">
          <span>Quantidade</span>
          <input
            inputMode="numeric"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="0"
            data-autofocus
          />
        </label>

        <div className={`stock-preview ${newStock < 0 ? 'is-invalid' : ''}`}>
          <span>Estoque atual: {product.stock_quantity}</span>
          <strong>Novo estoque: {newStock < 0 ? 'insuficiente' : newStock}</strong>
        </div>

        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}

        <div className="product-form-actions">
          <button type="button" className="btn btn-secondary btn-lg" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={!canSave}>
            {saving ? 'Salvando...' : 'Confirmar ajuste'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
