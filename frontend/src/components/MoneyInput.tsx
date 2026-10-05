import type { InputHTMLAttributes } from 'react'
import { formatMoney } from '../utils/format'

type MoneyInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
  value: number
  onChange: (cents: number) => void
}

export function MoneyInput({ value, onChange, ...props }: MoneyInputProps) {
  return (
    <input
      {...props}
      inputMode="numeric"
      value={formatMoney(value)}
      onChange={(event) => onChange(Number(event.target.value.replace(/\D/g, '').slice(-9)))}
    />
  )
}
