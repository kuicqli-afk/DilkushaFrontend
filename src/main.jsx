import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.jsx'
// loaded after the app's own styles so the theme wins
import './theme.css'

import { CartProvider } from './Context/CartContext.jsx'
import { WishlistProvider } from "./Context/WishlistContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <WishlistProvider>
        <App />
      </WishlistProvider>
    </CartProvider>
  </StrictMode>,
)
