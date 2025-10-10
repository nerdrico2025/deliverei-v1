import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ClientAuthProvider } from "./contexts/ClientAuthContext";
import { ToastProvider } from "./ui/feedback/ToastContext";
import { CartProvider } from "./contexts/CartContext";
import { NotificacoesProvider } from "./contexts/NotificacoesContext";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <AuthProvider>
      <ClientAuthProvider>
        <ToastProvider>
          <NotificacoesProvider>
            <CartProvider>
              <BrowserRouter>
                <AppRouter />
              </BrowserRouter>
            </CartProvider>
          </NotificacoesProvider>
        </ToastProvider>
      </ClientAuthProvider>
    </AuthProvider>
  );
}

export default App;
