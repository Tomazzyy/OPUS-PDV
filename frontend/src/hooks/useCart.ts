import { useState } from 'react'
import type { Product } from '../types'

export type CartItem = {
  product: Product
  quantity: number
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  function quantityOf(productId: number) {
    return items.find((item) => item.product.id === productId)?.quantity ?? 0
  }

  function canAdd(product: Product) {
    return quantityOf(product.id) < product.stock_quantity
  }

  function add(product: Product) {
    if (!canAdd(product)) {
      return false
    }

    setItems((current) =>
      current.some((item) => item.product.id === product.id)
        ? current.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
        : [...current, { product, quantity: 1 }],
    )

    return true
  }

  function decrease(productId: number) {
    setItems((current) =>
      current.map((item) =>
        item.product.id === productId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item,
      ),
    )
  }

  function remove(productId: number) {
    setItems((current) => current.filter((item) => item.product.id !== productId))
  }

  function clear() {
    setItems([])
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalCents = items.reduce((sum, item) => sum + item.product.price_cents * item.quantity, 0)

  return { items, itemCount, totalCents, canAdd, add, decrease, remove, clear }
}
