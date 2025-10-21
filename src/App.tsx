import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ToastProvider } from './ui/feedback/ToastContext';
import Login from './pages/public/Login';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;