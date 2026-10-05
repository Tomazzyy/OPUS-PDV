import { useEffect, useMemo, useState } from 'react'
import { ImageOff, Link, Trash2, Upload } from 'lucide-react'

export type ImageChange = { type: 'keep' } | { type: 'file'; file: File } | { type: 'url'; url: string } | { type: 'remove' }

type ProductImageFieldProps = {
  currentUrl: string | null
  value: ImageChange
  onChange: (value: ImageChange) => void
  error?: string
}

export function ProductImageField({ currentUrl, value, onChange, error }: ProductImageFieldProps) {
  const filePreview = useMemo(() => (value.type === 'file' ? URL.createObjectURL(value.file) : null), [value])

  useEffect(() => () => {
    if (filePreview) URL.revokeObjectURL(filePreview)
  }, [filePreview])

  const preview = {
    keep: currentUrl,
    file: filePreview,
    url: value.type === 'url' ? value.url.trim() : null,
    remove: null,
  }[value.type]

  return (
    <div className="field">
      <span>Foto</span>
      <div className="image-field">
        <ImagePreview key={preview} src={preview} />

        <div className="image-field-actions">
          <label className="btn btn-secondary">
            <Upload size={16} />
            Enviar arquivo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) onChange({ type: 'file', file })
                event.target.value = ''
              }}
            />
          </label>
          <button type="button" className="btn btn-secondary" onClick={() => onChange({ type: 'url', url: '' })}>
            <Link size={16} />
            Usar link
          </button>
          {preview && (
            <button type="button" className="btn btn-secondary image-field-remove" onClick={() => onChange({ type: 'remove' })}>
              <Trash2 size={16} />
              Remover
            </button>
          )}
        </div>
      </div>

      {value.type === 'url' && (
        <input
          type="url"
          value={value.url}
          onChange={(event) => onChange({ type: 'url', url: event.target.value })}
          placeholder="https://..."
          aria-label="Link da imagem"
          autoFocus
        />
      )}
      {value.type === 'file' && <small className="image-field-hint">{value.file.name}</small>}
      {error && <small className="field-error">{error}</small>}
    </div>
  )
}

function ImagePreview({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="image-field-preview">
      {src && !failed ? <img src={src} alt="" onError={() => setFailed(true)} /> : <ImageOff size={22} />}
    </div>
  )
}
