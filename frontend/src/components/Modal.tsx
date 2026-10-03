import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import './Modal.css'

type ModalProps = {
  onClose: () => void
  canClose?: boolean
  className?: string
  children: ReactNode
}

export function Modal({ onClose, canClose = true, className = '', children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    dialog?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    return () => dialog?.close()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className={`modal ${className}`}
      onCancel={(event) => {
        event.preventDefault()
        if (canClose) onClose()
      }}
    >
      {canClose && (
        <button className="modal-close" onClick={onClose} aria-label="Fechar">
          <X size={18} />
        </button>
      )}
      {children}
    </dialog>
  )
}
