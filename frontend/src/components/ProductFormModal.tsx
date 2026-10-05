import { useState, type FormEvent } from 'react'
import { CircleAlert } from 'lucide-react'
import { ApiError, createProduct, removeProductImage, setProductImageUrl, updateProduct, uploadProductImage } from '../services/api'
import type { Product } from '../types'
import { Modal } from './Modal'
import { MoneyInput } from './MoneyInput'
import { ProductImageField, type ImageChange } from './ProductImageField'
import './ProductModals.css'

type ProductFormModalProps = {
  product?: Product
  onClose: () => void
  onSaved: () => void
}

export function ProductFormModal({ product, onClose, onSaved }: ProductFormModalProps) {
  const [savedProduct, setSavedProduct] = useState(product)
  const [name, setName] = useState(product?.name ?? '')
  const [code, setCode] = useState(product?.code ?? '')
  const [priceCents, setPriceCents] = useState(product?.price_cents ?? 0)
  const [stockQuantity, setStockQuantity] = useState('0')
  const [active, setActive] = useState(product?.active ?? true)
  const [image, setImage] = useState<ImageChange>({ type: 'keep' })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const isEditing = savedProduct !== undefined

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    setError('')

    const data = { name: name.trim(), code: code.trim(), price_cents: priceCents, active }

    try {
      const saved = isEditing
        ? await updateProduct(savedProduct.id, data)
        : await createProduct({ ...data, stock_quantity: Number(stockQuantity) })

      setSavedProduct(saved)
      await saveImage(saved.id)
      onSaved()
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setErrors(err.errors)
      } else {
        setError(err instanceof ApiError ? err.message : 'Não foi possível salvar o produto.')
      }
      setSaving(false)
    }
  }

  async function saveImage(productId: number) {
    if (image.type === 'file') await uploadProductImage(productId, image.file)
    if (image.type === 'url') await setProductImageUrl(productId, image.url.trim())
    if (image.type === 'remove') await removeProductImage(productId)
  }

  return (
    <Modal onClose={onClose} canClose={!saving}>
      <form className="product-form" onSubmit={handleSubmit} noValidate>
        <h2 className="modal-title">{isEditing ? 'Editar produto' : 'Novo produto'}</h2>

        {error && (
          <div className="product-form-error" role="alert">
            <CircleAlert size={16} />
            {error}
          </div>
        )}

        <label className="field">
          <span>Nome</span>
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} data-autofocus />
          {errors.name && <small className="field-error">{errors.name[0]}</small>}
        </label>

        <div className="product-form-row">
          <label className="field">
            <span>Código</span>
            <input value={code} onChange={(event) => setCode(event.target.value)} maxLength={30} />
            {errors.code && <small className="field-error">{errors.code[0]}</small>}
          </label>

          <label className="field">
            <span>Preço</span>
            <MoneyInput value={priceCents} onChange={setPriceCents} />
            {errors.price_cents && <small className="field-error">{errors.price_cents[0]}</small>}
          </label>
        </div>

        {!isEditing && (
          <label className="field">
            <span>Estoque inicial</span>
            <input
              inputMode="numeric"
              value={stockQuantity}
              onChange={(event) => setStockQuantity(event.target.value.replace(/\D/g, '').slice(0, 6))}
            />
            {errors.stock_quantity && <small className="field-error">{errors.stock_quantity[0]}</small>}
          </label>
        )}

        <ProductImageField
          currentUrl={savedProduct?.image_url ?? null}
          value={image}
          onChange={setImage}
          error={errors.image?.[0] ?? errors.image_url?.[0]}
        />

        <label className="product-form-check">
          <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
          Disponível para venda no caixa
        </label>

        {isEditing && <p className="product-form-hint">Para alterar o estoque, use o botão "Estoque" na lista.</p>}

        <div className="product-form-actions">
          <button type="button" className="btn btn-secondary btn-lg" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
