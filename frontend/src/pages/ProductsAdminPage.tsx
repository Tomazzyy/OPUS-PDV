import { useState } from 'react'
import { CircleAlert, ImageOff, PackagePlus, Pencil, Plus, Search, SearchX } from 'lucide-react'
import { ProductFormModal } from '../components/ProductFormModal'
import { StockAdjustModal } from '../components/StockAdjustModal'
import { useProducts } from '../hooks/useProducts'
import { ApiError, getAdminProducts, updateProduct } from '../services/api'
import type { Product } from '../types'
import { formatMoney } from '../utils/format'
import './ProductsAdminPage.css'

const LOW_STOCK = 5

export function ProductsAdminPage() {
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const [adjusting, setAdjusting] = useState<Product | null>(null)
  const [actionError, setActionError] = useState('')
  const { products, loading, error, retry } = useProducts(search, getAdminProducts)

  async function toggleActive(product: Product) {
    setActionError('')

    try {
      await updateProduct(product.id, { active: !product.active })
      retry()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Não foi possível alterar o produto.')
    }
  }

  function handleSaved() {
    setEditing(null)
    setAdjusting(null)
    retry()
  }

  return (
    <div className="admin-products card">
      <header className="admin-products-header">
        <div>
          <h2>Produtos</h2>
          {!loading && <span>{products.length} {products.length === 1 ? 'produto' : 'produtos'}</span>}
        </div>
        <div className="admin-products-tools">
          <label className="admin-products-search">
            <Search size={16} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou código..."
              aria-label="Buscar produto"
            />
          </label>
          <button className="btn btn-primary" onClick={() => setEditing('new')}>
            <Plus size={16} />
            Novo produto
          </button>
        </div>
      </header>

      {actionError && (
        <div className="admin-products-alert" role="alert">
          <CircleAlert size={16} />
          {actionError}
        </div>
      )}

      {error ? (
        <div className="admin-products-state">
          <CircleAlert size={24} className="admin-products-state-error" />
          <p>Não foi possível carregar os produtos.</p>
          <button className="btn btn-secondary" onClick={retry}>
            Tente novamente
          </button>
        </div>
      ) : loading && products.length === 0 ? (
        <div className="admin-products-state">
          <p>Carregando produtos...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="admin-products-state">
          <SearchX size={24} />
          <p>Nenhum produto encontrado.</p>
        </div>
      ) : (
        <table className="admin-products-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Código</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Status</th>
              <th aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className={product.active ? '' : 'is-inactive'}>
                <td>
                  <div className="admin-products-name">
                    <span className="admin-products-thumb">
                      {product.image_url ? <img src={product.image_url} alt="" /> : <ImageOff size={16} />}
                    </span>
                    {product.name}
                  </div>
                </td>
                <td>{product.code}</td>
                <td>{formatMoney(product.price_cents)}</td>
                <td>
                  <span className={stockClass(product.stock_quantity)}>{product.stock_quantity}</span>
                </td>
                <td>
                  <button
                    className={`admin-products-status ${product.active ? 'is-active' : ''}`}
                    onClick={() => toggleActive(product)}
                    title={product.active ? 'Clique para desativar' : 'Clique para ativar'}
                  >
                    {product.active ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td>
                  <div className="admin-products-actions">
                    <button className="btn btn-secondary" onClick={() => setAdjusting(product)}>
                      <PackagePlus size={16} />
                      Estoque
                    </button>
                    <button className="btn btn-secondary" onClick={() => setEditing(product)} aria-label={`Editar ${product.name}`}>
                      <Pencil size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && (
        <ProductFormModal
          product={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}

      {adjusting && <StockAdjustModal product={adjusting} onClose={() => setAdjusting(null)} onSaved={handleSaved} />}
    </div>
  )
}

function stockClass(quantity: number) {
  if (quantity === 0) return 'admin-products-stock is-empty'
  if (quantity <= LOW_STOCK) return 'admin-products-stock is-low'
  return 'admin-products-stock'
}
