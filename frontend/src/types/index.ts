export type User = {
  id: number
  name: string
  email: string
}

export type Product = {
  id: number
  name: string
  code: string
  price_cents: number
  stock_quantity: number
  active: boolean
}

export type PaymentMethod = 'cash' | 'credit' | 'debit'

export type SaleItem = {
  id: number
  product_id: number
  product_name: string
  product_code: string
  unit_price_cents: number
  quantity: number
  subtotal_cents: number
}

export type Sale = {
  id: number
  payment_method: PaymentMethod
  subtotal_cents: number
  total_cents: number
  amount_received_cents: number | null
  change_cents: number | null
  operator_name: string
  created_at: string
  items: SaleItem[]
}

export type NewSale = {
  items: { product_id: number; quantity: number }[]
  payment_method: PaymentMethod
  amount_received_cents?: number
}
