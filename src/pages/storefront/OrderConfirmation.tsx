import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { CheckCircle, X } from "lucide-react";
import { useClientAuth } from "../../contexts/ClientAuthContext";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const pedidoId = searchParams.get("pedido");
  const { isAuthenticated } = useClientAuth();
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingAccount, setPendingAccount] = useState<any>(null);

  useEffect(() => {
    // Check if there's a pending account creation
    const pendingData = sessionStorage.getItem("pendingAccount");
    if (pendingData && !isAuthenticated) {
      setPendingAccount(JSON.parse(pendingData));
      setShowPasswordModal(true);
    }
  }, [isAuthenticated]);

  const handleCreateAccount = async () => {
    setPasswordError("");
    
    if (password.length < 6) {
      setPasswordError("A senha deve ter no mínimo 6 caracteres");
      return;
    }
    
    if (password !== confirmPassword) {
      setPasswordError("As senhas não coincidem");
      return;
    }
    
    setLoading(true);
    
    try {
      // Get empresaId from slug
      // Note: In production, you should fetch this from the API
      // For now, we'll fetch the empresa data from the backend
      const empresaResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/empresas/slug/${slug}`);
      
      if (!empresaResponse.ok) {
        throw new Error("Empresa não encontrada");
      }
      
      const empresaData = await empresaResponse.json();
      
      // Call API to create account
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/create-account-from-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...pendingAccount,
          senha: password,
          empresaId: empresaData.id,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar conta");
      }
      
      const data = await response.json();
      
      // Save authentication data
      localStorage.setItem("deliverei_client_auth", JSON.stringify({
        isAuthenticated: true,
        cliente: data.user,
        token: data.accessToken,
      }));
      
      // Clear pending account data
      sessionStorage.removeItem("pendingAccount");
      
      // Show success message
      alert(`Conta criada com sucesso! Você já está logado.`);
      setShowPasswordModal(false);
      
      // Optionally reload the page to update authentication state
      window.location.reload();
    } catch (error) {
      console.error("Error creating account:", error);
      setPasswordError(error instanceof Error ? error.message : "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Clear pending account data
    sessionStorage.removeItem("pendingAccount");
    setShowPasswordModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12">
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-md border border-[#E5E7EB] bg-white p-8 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <CheckCircle className="text-[#16A34A]" size={64} />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-[#1F2937]">Pedido confirmado!</h1>
          <p className="mb-6 text-[#4B5563]">
            Seu pedido foi recebido com sucesso. Em breve você receberá uma confirmação no WhatsApp.
          </p>
          <div className="mb-6 rounded bg-[#F9FAFB] p-4">
            <div className="mb-1 text-sm text-[#4B5563]">Número do pedido</div>
            <div className="text-xl font-bold text-[#1F2937]">#{pedidoId || "12345"}</div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a href={`/loja/${slug}`}>
              <Button variant="secondary">Voltar à loja</Button>
            </a>
            <Button variant="primary">Acompanhar pedido</Button>
          </div>
        </div>
      </div>

      {/* Password Setup Modal */}
      {showPasswordModal && pendingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1F2937]">Crie sua conta</h2>
              <button
                onClick={handleSkip}
                className="text-[#6B7280] hover:text-[#1F2937]"
              >
                <X size={24} />
              </button>
            </div>
            
            <p className="mb-4 text-sm text-[#4B5563]">
              Detectamos que esta é sua primeira compra! Defina uma senha para acessar sua conta e acompanhar seus pedidos.
            </p>
            
            <div className="mb-4 rounded-md bg-[#F9FAFB] p-3 text-sm">
              <p className="text-[#4B5563]">
                <strong>Email:</strong> {pendingAccount.email}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Input
                  type="password"
                  placeholder="Senha (mínimo 6 caracteres)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Confirme a senha"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError("");
                  }}
                />
              </div>
              {passwordError && (
                <p className="text-xs text-red-600">{passwordError}</p>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Button
                variant="primary"
                onClick={handleCreateAccount}
                loading={loading}
                className="w-full"
              >
                Criar conta
              </Button>
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="w-full"
              >
                Agora não
              </Button>
            </div>
            
            <p className="mt-3 text-xs text-[#6B7280] text-center">
              Você pode definir sua senha depois através do email que enviamos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
