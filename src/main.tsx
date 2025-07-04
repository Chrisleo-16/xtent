
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

console.log('🚀 Application starting...');

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('🚨 Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason);
});

try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  console.log('✅ Root element found, creating React root...');
  
  const root = createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  
  console.log('✅ React app rendered successfully');
} catch (error) {
  console.error('❌ Failed to start application:', error);
  
  // Fallback error display
  document.body.innerHTML = `
    <div style="
      min-h: 100vh; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      margin: 0;
      padding: 20px;
    ">
      <div style="
        background: white; 
        padding: 2rem; 
        border-radius: 12px; 
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        text-align: center;
        max-width: 400px;
        width: 100%;
        border: 1px solid #e2e8f0;
      ">
        <div style="
          width: 48px;
          height: 48px;
          background: #fef2f2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        ">
          <span style="color: #dc2626; font-size: 24px;">⚠</span>
        </div>
        <h1 style="color: #1e293b; margin-bottom: 1rem; font-size: 1.25rem; font-weight: 600;">Failed to Load XTENT App</h1>
        <p style="color: #64748b; margin-bottom: 1.5rem; font-size: 0.875rem; line-height: 1.5;">
          There was a critical error starting the application. Please try refreshing the page.
        </p>
        <button onclick="window.location.reload()" style="
          background: #16a34a; 
          color: white; 
          border: none; 
          padding: 0.75rem 1.5rem; 
          border-radius: 6px; 
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background-color 0.2s;
        " onmouseover="this.style.background='#15803d'" onmouseout="this.style.background='#16a34a'">
          Refresh Page
        </button>
      </div>
    </div>
  `;
}
