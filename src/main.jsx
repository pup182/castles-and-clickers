import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Import combat simulator for console access (dev/balance testing)
// Dynamic import keeps the 1,657-line file out of production bundles
if (import.meta.env.DEV) {
  import('./game/combatSimulator.js');
}

// Note: StrictMode disabled for performance testing
// StrictMode causes double-renders in development which adds overhead
createRoot(document.getElementById('root')).render(
  <App />
)
