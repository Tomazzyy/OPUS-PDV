import { useState } from 'react'
import { CircleAlert, ImageOff, Plus, SearchX } from 'lucide-react'
import type { Product } from '../types'
import { formatMoney } from '../utils/format'
import './ProductList.css'

type ProductListProps = {
  products: Product[]
  loading: boolean
  error: boolean
  onRetry: () => void
  onAdd: (product: Product) => void
}

export function ProductList({ products, loading, error, onRetry, onAdd }: ProductListProps) {
  if (error) {
    return (
      <div className="product-list-state">
        <CircleAlert size={28} className="product-list-state-error" />
        <p>Não foi possível carregar os produtos.</p>
        <button className="btn btn-secondary" onClick={onRetry}>
          Tente novamente
        </button>
      </div>
    )
  }

  if (loading && products.length === 0) {
    return (
      <div className="product-list-state">
        <p>Carregando produtos...</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="product-list-state">
        <SearchX size={28} />
        <p>Nenhum produto encontrado.</p>
      </div>
    )
  }

  return (
    <ul className="product-list">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} onAdd={onAdd} />
        </li>
      ))}
    </ul>
  )
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  const [imageFailed, setImageFailed] = useState(false)
  const outOfStock = product.stock_quantity === 0

  return (
    <article className={`product-card ${outOfStock ? 'is-unavailable' : ''}`}>
      <div className="product-card-image">
        {product.image_url && !imageFailed ? (
          <img src={product.image_url} alt={product.name} loading="lazy" onError={() => setImageFailed(true)} />
        ) : (
          <ImageOff size={28} />
        )}
        {outOfStock && <span className="product-card-badge">Sem estoque</span>}
      </div>

      <div className="product-card-body">
        <h3 title={product.name}>{product.name}</h3>
        <span className="product-card-code">Cód. {product.code}</span>

        <div className="product-card-footer">
          <strong>{formatMoney(product.price_cents)}</strong>
          <button
            className="product-card-add"
            onClick={() => onAdd(product)}
            disabled={outOfStock}
            aria-label={`Adicionar ${product.name}`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </article>
  )
}
