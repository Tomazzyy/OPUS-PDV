import type { PaymentMethod } from '../types'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

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
