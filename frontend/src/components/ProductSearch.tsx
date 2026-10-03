import { useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import './ProductSearch.css'

type ProductSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function ProductSearch({ value, onChange }: ProductSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function clear() {
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <div className="product-search">
      <Search size={20} className="product-search-icon" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => event.key === 'Escape' && onChange('')}
        placeholder="Buscar produto por nome ou código..."
        aria-label="Buscar produto"
        autoFocus
      />
      {value ? (
        <button className="product-search-clear" onClick={clear} aria-label="Limpar busca">
          <X size={16} />
        </button>
      ) : (
        <kbd className="product-search-shortcut">Ctrl + K</kbd>
      )}
    </div>
  )
}
