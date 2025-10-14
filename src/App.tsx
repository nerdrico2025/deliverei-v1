/**
 * Main App Component
 * 
 * Root application component with all providers and error boundary
 * 
 * @refactored Phase 2 - Added ErrorBoundary for error handling
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ClientAuthProvider } from './contexts/ClientAuthContext';
import { ToastProvider } from './ui/feedback/ToastContext';
import { CartProvider } from './contexts/CartContext';
import { NotificacoesProvider } from './contexts/NotificacoesContext';
import { ErrorBoundary } from './components/common';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ClientAuthProvider>
          <ToastProvider>
            <NotificacoesProvider>
              <CartProvider>
                <ErrorBoundary>
                  <BrowserRouter>
                    <AppRouter />
                  </BrowserRouter>
                </ErrorBoundary>
              </CartProvider>
            </NotificacoesProvider>
          </ToastProvider>
        </ClientAuthProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
