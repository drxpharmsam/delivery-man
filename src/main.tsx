import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'

const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML =
    '<div style="padding:2rem;font-family:sans-serif;color:#c00">' +
    '<h2>Delivery Rider</h2><p>Unable to start: root element not found. ' +
    'Please reload the page or contact support.</p></div>';
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
