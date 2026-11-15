import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Checkout from './pages/Checkout'
import Kontakt from './pages/Kontakt'
import { CartProvider } from '@/lib/cart-context'

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/porudzbina" element={<Checkout />} />
        <Route path="/kontakt" element={<Kontakt />} />
      </Routes>
    </CartProvider>
  )
}
