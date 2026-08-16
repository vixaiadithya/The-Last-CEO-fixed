import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Suppress specific annoying warnings from third-party libraries
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string') {
    if (args[0].includes('React Router Future Flag Warning')) return;
    if (args[0].includes('THREE.Clock: This module has been deprecated')) return;
  }
  originalWarn(...args);
};

const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string') {
    if (args[0].includes('THREE.WebGLRenderer: Context Lost')) return;
  }
  originalError(...args);
};

createRoot(document.getElementById('root')!).render(
  <App />
)
