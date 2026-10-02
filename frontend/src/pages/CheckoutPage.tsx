import { ShoppingCart } from 'lucide-react'
import './CheckoutPage.css'

export function CheckoutPage() {
  return (
    <div className="checkout">
      <section className="checkout-products card">
        <h2 className="checkout-title">Produtos</h2>
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
