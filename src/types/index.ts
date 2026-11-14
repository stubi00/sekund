export interface Product {
  id: string
  name: string
  price: number
  category: string
  size?: string
  description: string
  imageUrl?: string
  images?: string[]
  color: string
}

export interface CartItem {
  product: Product
  qty: number
}

export interface HeroCard {
  name: string
  category: string
  price: number
  imageUrl?: string
}

export interface SiteSettings {
  heroCards: HeroCard[]
  stamp: string
  aboutText?: string
}

export interface Order {
  id: string
  createdAt: string
  customer: string
  phone: string
  address: string
  city: string
  note: string
  payment: 'pouzece'
  items: { name: string; price: number; qty: number }[]
  total: number
}
