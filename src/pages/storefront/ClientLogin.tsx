import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useClientAuth } from "../../contexts/ClientAuthContext";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { ArrowLeft, LogIn } from "lucide-react";

export default function ClientLogin() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { login, isAuthenticated } = useClientAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get the redirect path from location state, default to storefront
  const from = (location.state as any)?.from || `/loja/${slug}`;

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password, slug || "");
      // Redirect will happen via useEffect after state updates
    } catch (err) {
      setError("Email ou senha incorretos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D22630] to-[#A01D26] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate(`/loja/${slug}`)}
          className="mb-4 flex items-center gap-2 text-white hover:text-white/80 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Voltar para loja</span>
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D22630] rounded-full mb-4">
              <LogIn className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-[#1F2937] mb-2">Entrar na sua conta</h1>
            <p className="text-[#6B7280]">Acesse para fazer pedidos mais rápido</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1F2937] mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1F2937] mb-1">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Entrar
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
            <p className="text-center text-sm text-[#6B7280]">
              Não tem uma conta?{" "}
              <button
                onClick={() => alert("Funcionalidade de cadastro em desenvolvimento")}
                className="text-[#D22630] hover:text-[#A01D26] font-medium"
              >
                Cadastre-se
              </button>
            </p>
            <p className="text-center text-sm text-[#6B7280] mt-2">
              <button
                onClick={() => alert("Funcionalidade de recuperação de senha em desenvolvimento")}
                className="text-[#D22630] hover:text-[#A01D26] font-medium"
              >
                Esqueceu sua senha?
              </button>
            </p>
          </div>

          {/* Test credentials hint */}
          <div className="mt-6 p-3 bg-[#FFC107]/10 border border-[#FFC107]/30 rounded-md">
            <p className="text-xs text-[#1F2937] font-medium mb-1">💡 Credenciais de teste:</p>
            <p className="text-xs text-[#6B7280]">Email: cliente@exemplo.com</p>
            <p className="text-xs text-[#6B7280]">Senha: cliente123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
