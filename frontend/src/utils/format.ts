import type { PaymentMethod } from '../types'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

const time = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' })

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Dinheiro',
  credit: 'Crédito',
  debit: 'Débito',
}

export function formatMoney(cents: number) {
  return currency.format(cents / 100)
}

export function formatDateTime(value: string | Date) {
  return dateTime.format(new Date(value))
}

export function formatTime(value: string | Date) {
  return time.format(new Date(value))
}

export function todayISODate() {
  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${today.getFullYear()}-${month}-${day}`
}
