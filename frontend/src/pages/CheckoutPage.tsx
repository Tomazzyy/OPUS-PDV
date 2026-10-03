import { useRef, useState } from 'react'
import { Cart } from '../components/Cart'
import { PaymentModal } from '../components/PaymentModal'
import { ProductList } from '../components/ProductList'
import { ProductSearch } from '../components/ProductSearch'
import { SaleSuccessModal } from '../components/SaleSuccessModal'
import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'
import { getProducts } from '../services/api'
import type { Product, Sale } from '../types'
import './CheckoutPage.css'

export function CheckoutPage() {
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [paying, setPaying] = useState(false)
  const [completedSale, setCompletedSale] = useState<Sale | null>(null)
  const noticeTimer = useRef<number>(undefined)
  const searchRef = useRef<HTMLInputElement>(null)
  const { products, loading, error, retry } = useProducts(search)
  const cart = useCart()

  function completeSale(sale: Sale) {
    setPaying(false)
    setCompletedSale(sale)
    cart.clear()
    retry()
  }

  function startNewSale() {
    setCompletedSale(null)
    setSearch('')
    setTimeout(() => searchRef.current?.focus())
  }

  function showNotice(message: string) {
    setNotice(message)
    clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(''), 3000)
  }

  function addToCart(product: Product) {
    if (cart.add(product)) {
      return true
    }

    showNotice(
      product.stock_quantity === 0
        ? `${product.name} está sem estoque.`
        : `Só há ${product.stock_quantity} unidade(s) de ${product.name} em estoque.`,
    )

    return false
  }

  async function addByCode(term: string) {
    const code = term.trim()

    if (!code) {
      return
    }

    try {
      const results = await getProducts(code)
      const product = results.find((item) => item.code === code) ?? (results.length === 1 ? results[0] : undefined)

      if (!product) {
        showNotice(
          results.length > 1
            ? 'Mais de um produto encontrado. Selecione na lista.'
            : `Nenhum produto encontrado para "${code}".`,
        )
        return
      }

      if (addToCart(product)) {
        setSearch('')
      }
    } catch {
      showNotice('Não foi possível buscar o produto. Tente novamente.')
    }
  }

  return (
    <div className="checkout">
      <section className="checkout-products card">
        <ProductSearch value={search} onChange={setSearch} onSubmit={addByCode} inputRef={searchRef} />
        {notice && (
          <p className="checkout-notice" role="alert">
            {notice}
          </p>
        )}
        <div className="checkout-products-list">
          <ProductList products={products} loading={loading} error={error} onRetry={retry} onAdd={addToCart} />
        </div>
      </section>

      <Cart
        items={cart.items}
        itemCount={cart.itemCount}
        totalCents={cart.totalCents}
        canAdd={cart.canAdd}
        onIncrease={addToCart}
        onDecrease={cart.decrease}
        onRemove={cart.remove}
        onClear={cart.clear}
        onCheckout={() => setPaying(true)}
      />

      {paying && (
        <PaymentModal
          items={cart.items}
          totalCents={cart.totalCents}
          onClose={() => setPaying(false)}
          onCompleted={completeSale}
          onFailed={retry}
        />
      )}

      {completedSale && <SaleSuccessModal sale={completedSale} onNewSale={startNewSale} />}
    </div>
  )
}
