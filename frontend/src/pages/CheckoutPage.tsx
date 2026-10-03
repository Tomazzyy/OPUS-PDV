import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { ProductList } from '../components/ProductList'
import { ProductSearch } from '../components/ProductSearch'
import { useProducts } from '../hooks/useProducts'
import type { Product } from '../types'
import './CheckoutPage.css'

export function CheckoutPage() {
  const [search, setSearch] = useState('')
  const { products, loading, error, retry } = useProducts(search)

  function addToCart(product: Product) {
    console.info('Adicionar ao carrinho:', product.name)
  }

  return (
    <div className="checkout">
      <section className="checkout-products card">
        <ProductSearch value={search} onChange={setSearch} />
        <div className="checkout-products-list">
          <ProductList products={products} loading={loading} error={error} onRetry={retry} onAdd={addToCart} />
        </div>
      </section>

      <aside className="checkout-cart card">
        <h2 className="checkout-title">Carrinho</h2>
        <div className="checkout-empty">
          <ShoppingCart size={32} strokeWidth={1.5} />
          <p>Seu carrinho está vazio.</p>
        </div>
      </aside>
    </div>
  )
}
