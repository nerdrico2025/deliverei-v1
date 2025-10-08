
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PublicHeader } from "../../components/layout/PublicHeader";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../ui/feedback/ToastContext";
import { authApi } from "../../services/backendApi";

const EMPRESAS_DISPONIVEIS = [
  { slug: 'pizza-express', nome: 'Pizza Express' },
  { slug: 'burger-king', nome: 'Burger King' },
];

export default function LoginBackend() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [empresaSlug, setEmpresaSlug] = useState("pizza-express");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;

    const state = location.state as any;
    if (state?.from) {
      navigate(state.from, { replace: true });
      return;
    }

    // Redirecionar para vitrine após login
    navigate("/storefront", { replace: true });
  }, [user, navigate, location.state]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Chamar API real do backend
      const response = await authApi.login({
        email,
        senha: password,
        empresaSlug,
      });

      // Salvar tokens
      localStorage.setItem('deliverei_token', response.accessToken);
      localStorage.setItem('deliverei_refresh_token', response.refreshToken);
      localStorage.setItem('deliverei_tenant_slug', empresaSlug);

      // Atualizar contexto de autenticação (mock para compatibilidade)
      await login(email, password);
      
      push({ message: "Login realizado com sucesso!", tone: "success" });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.';
      push({ message: errorMsg, tone: "error" });
      console.error('Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PublicHeader />
      <div className="mx-auto grid max-w-md gap-4 px-4 py-12">
        <div className="rounded-md border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h1 className="mb-4 text-xl font-semibold text-[#1F2937]">Entrar - Backend Real</h1>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-[#4B5563]">Empresa</label>
              <select
                value={empresaSlug}
                onChange={(e) => setEmpresaSlug(e.target.value)}
                className="w-full rounded-md border border-[#E5E7EB] px-3 py-2 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
                required
              >
                {EMPRESAS_DISPONIVEIS.map((empresa) => (
                  <option key={empresa.slug} value={empresa.slug}>
                    {empresa.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-[#4B5563]">E-mail</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[#4B5563]">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" loading={loading} variant="primary" className="w-full">
              Entrar
            </Button>
          </form>
          
          <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
            <div className="font-semibold mb-2">Credenciais de Teste:</div>
            
            <div className="mb-2">
              <div className="font-semibold">Pizza Express:</div>
              <div>• Admin: admin@pizza-express.com / pizza123</div>
            </div>
            
            <div className="mb-2">
              <div className="font-semibold">Burger King:</div>
              <div>• Admin: admin@burger-king.com / pizza123</div>
            </div>
            
            <div>
              <div className="font-semibold">Cliente (qualquer empresa):</div>
              <div>• cliente@exemplo.com / cliente123</div>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-[#6B7280]">
            <a href="/login" className="text-[#D22630] hover:underline">
              ← Voltar para login mock
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
