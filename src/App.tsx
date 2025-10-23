import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ToastProvider } from './ui/feedback/ToastContext';
import AppRouter from './routes/AppRouter';
import { ClientAuthProvider } from './contexts/ClientAuthContext';
import { CartProvider } from './contexts/CartContext';

function App() {
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