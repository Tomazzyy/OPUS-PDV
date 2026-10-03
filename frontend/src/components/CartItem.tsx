import { ImageOff, Minus, Plus, Trash2 } from 'lucide-react'
import type { CartItem as CartItemType } from '../hooks/useCart'
import { formatMoney } from '../utils/format'

type CartItemProps = {
  item: CartItemType
  canIncrease: boolean
  onIncrease: () => void
  onDecrease: () => void
  onRemove: () => void
}

export function CartItem({ item, canIncrease, onIncrease, onDecrease, onRemove }: CartItemProps) {
  const { product, quantity } = item

  return (
    <li className="cart-item">
      <div className="cart-item-image">
        {product.image_url ? <img src={product.image_url} alt="" /> : <ImageOff size={18} />}
      </div>

      <div className="cart-item-info">
        <span className="cart-item-name" title={product.name}>
          {product.name}
        </span>
        <span className="cart-item-price">{formatMoney(product.price_cents)} un.</span>
      </div>

      <div className="cart-item-quantity">
        <button onClick={onDecrease} disabled={quantity === 1} aria-label="Diminuir quantidade">
          <Minus size={14} />
        </button>
        <span>{quantity}</span>
        <button
          onClick={onIncrease}
          disabled={!canIncrease}
          aria-label="Aumentar quantidade"
          title={canIncrease ? undefined : 'Quantidade máxima em estoque'}
        >
          <Plus size={14} />
        </button>
      </div>

      <strong className="cart-item-subtotal">{formatMoney(product.price_cents * quantity)}</strong>

      <button className="cart-item-remove" onClick={onRemove} aria-label={`Remover ${product.name}`}>
        <Trash2 size={16} />
      </button>
    </li>
  )
}
