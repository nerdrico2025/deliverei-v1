
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PublicHeader } from "../../components/layout/PublicHeader";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../ui/feedback/ToastContext";
import { authApi } from "../../services/backendApi";
import { resolveTenantSlug } from "../../services/api.utils";

export default function LoginBackend() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    // Redirecionamento baseado no papel
    let redirectPath = "/storefront-backend"; // padrão para cliente
    if (user.role === "superadmin") {
      redirectPath = "/admin/super";
    } else if (user.role === "empresa") {
      redirectPath = "/admin/store";
    } else if (user.role === "suporte") {
      redirectPath = "/support/tickets";
    } else if (user.role === "cliente") {
      redirectPath = "/storefront-backend";
    }

    navigate(redirectPath, { replace: true });
  }, [user, navigate, location.state]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Login com e-mail e senha; backend localiza empresa do usuário
      const response = await authApi.login({
        email,
        senha: password,
      });

      // Validar presença de tokens
      if (!response?.accessToken) {
        throw new Error('Resposta do backend sem accessToken');
      }

      // Salvar tokens
      localStorage.setItem('deliverei_token', response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('deliverei_refresh_token', response.refreshToken);
      }

      // Extrair slug da empresa (compatível com diferentes formatos de resposta)
      const slug = response?.empresa?.slug || response?.user?.empresa?.slug || response?.usuario?.empresa?.slug || '';
      if (slug) {
        localStorage.setItem('deliverei_tenant_slug', slug);
        localStorage.setItem('deliverei_store_slug', slug);
      }

      // Persistir nome da empresa se disponível
      const companyName = response?.empresa?.nome || response?.user?.empresa?.nome || response?.usuario?.empresa?.nome || '';
      if (companyName) {
        localStorage.setItem('deliverei_company_name', companyName);
      }

      // Atualizar contexto de autenticação (hidrata sem nova chamada se token+slug presentes)
      await login(email, password);
      
      push({ message: 'Login realizado com sucesso!', tone: 'success' });
    } catch (error: any) {
      // Exigir dados reais do backend
      const msg = error?.response?.data?.message || error?.message || 'Falha no login. Verifique suas credenciais e conexão com o backend.';
      push({ message: msg, tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PublicHeader />
      <div className="mx-auto grid max-w-md gap-4 px-4 py-12">
        <div className="rounded-md border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h1 className="mb-4 text-xl font-semibold text-[#1F2937]">Entrar</h1>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-[#4B5563]">E-mail</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com.br"
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
        </div>
      </div>
    </>
  );
}
