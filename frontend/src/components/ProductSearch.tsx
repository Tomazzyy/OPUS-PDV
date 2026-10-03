import { useEffect, type RefObject } from 'react'
import { Search, X } from 'lucide-react'
import './ProductSearch.css'

type ProductSearchProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  inputRef: RefObject<HTMLInputElement | null>
}

export function ProductSearch({ value, onChange, onSubmit, inputRef }: ProductSearchProps) {
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
  }, [inputRef])

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
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSubmit(value)
          if (event.key === 'Escape') onChange('')
        }}
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
