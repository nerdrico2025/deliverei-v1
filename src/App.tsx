import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ToastProvider } from './ui/feedback/ToastContext';
import AppRouter from './routes/AppRouter';
import { ClientAuthProvider } from './contexts/ClientAuthContext';
import { CartProvider } from './contexts/CartContext';
import { resolveTenantSlug, persistTenantSlug } from './services/api.utils';
import ErrorBoundary from './components/util/ErrorBoundary';

function App() {
  // Inicializar e persistir slug multi-tenant no startup
  useEffect(() => {
    const slug = resolveTenantSlug();
    if (slug) {
      persistTenantSlug(slug);
    }
  }, []);
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ClientAuthProvider>
            <CartProvider>
              <div className="min-h-screen bg-gray-50">
                <ErrorBoundary>
                  <AppRouter />
                </ErrorBoundary>
              </div>
            </CartProvider>
          </ClientAuthProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
