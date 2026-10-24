import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
// Poppins served from this site (Latin, the weights the theme uses):
// no render-blocking request to Google Fonts
import '@fontsource/poppins/latin-400.css'
import '@fontsource/poppins/latin-500.css'
import '@fontsource/poppins/latin-600.css'
import '@fontsource/poppins/latin-700.css'
import '@fontsource/poppins/latin-800.css'
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
