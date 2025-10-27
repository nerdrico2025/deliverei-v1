import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ToastProvider } from './ui/feedback/ToastContext';
import AppRouter from './routes/AppRouter';
import { ClientAuthProvider } from './contexts/ClientAuthContext';
import { CartProvider } from './contexts/CartContext';
import { resolveTenantSlug, persistTenantSlug } from './services/api.utils';

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
                <AppRouter />
              </div>
            </CartProvider>
          </ClientAuthProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;