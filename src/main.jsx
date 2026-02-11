import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Note: StrictMode disabled for performance testing
// StrictMode causes double-renders in development which adds overhead
createRoot(document.getElementById('root')).render(
  <App />
)
