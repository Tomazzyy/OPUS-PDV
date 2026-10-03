import { ShoppingCart } from 'lucide-react'
import type { CartItem as CartItemType } from '../hooks/useCart'
import type { Product } from '../types'
import { formatMoney } from '../utils/format'
import { CartItem } from './CartItem'
import './Cart.css'

type CartProps = {
  items: CartItemType[]
  itemCount: number
  totalCents: number
  canAdd: (product: Product) => boolean
  onIncrease: (product: Product) => void
  onDecrease: (productId: number) => void
  onRemove: (productId: number) => void
  onClear: () => void
  onCheckout: () => void
}

export function Cart({ items, itemCount, totalCents, canAdd, onIncrease, onDecrease, onRemove, onClear, onCheckout }: CartProps) {
  const isEmpty = items.length === 0

  function handleClear() {
    if (window.confirm('Remover todos os itens do carrinho?')) {
      onClear()
    }
  }

  return (
    <aside className="cart card">
      <header className="cart-header">
        <h2>Carrinho</h2>
        {!isEmpty && (
          <>
            <span className="cart-count">
              {itemCount} {itemCount === 1 ? 'item' : 'itens'}
            </span>
            <button className="cart-clear" onClick={handleClear}>
              Limpar
            </button>
          </>
        )}
      </header>

      {isEmpty ? (
        <div className="cart-empty">
          <ShoppingCart size={32} strokeWidth={1.5} />
          <p>Seu carrinho está vazio.</p>
          <span>Busque um produto e clique em + para adicionar.</span>
        </div>
      ) : (
        <ul className="cart-items">
          {items.map((item) => (
            <CartItem
              key={item.product.id}
              item={item}
              canIncrease={canAdd(item.product)}
              onIncrease={() => onIncrease(item.product)}
              onDecrease={() => onDecrease(item.product.id)}
              onRemove={() => onRemove(item.product.id)}
            />
          ))}
        </ul>
      )}

      <footer className="cart-footer">
        <div className="cart-line">
          <span>Subtotal</span>
          <span>{formatMoney(totalCents)}</span>
        </div>
        <div className="cart-line cart-total">
          <span>Total</span>
          <strong>{formatMoney(totalCents)}</strong>
        </div>
        <button className="btn btn-primary btn-lg" onClick={onCheckout} disabled={isEmpty}>
          Finalizar venda
        </button>
      </footer>
    </aside>
  )
}
