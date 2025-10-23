
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PublicHeader } from "../../components/layout/PublicHeader";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../ui/feedback/ToastContext";
import { authApi } from "../../services/backendApi";

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

      // Salvar tokens e slug retornado (compatível com headers do apiClient)
      localStorage.setItem('deliverei_token', response.accessToken);
      localStorage.setItem('deliverei_refresh_token', response.refreshToken);
      const slug = response?.empresa?.slug || '';
      if (slug) {
        localStorage.setItem('deliverei_tenant_slug', slug);
        localStorage.setItem('deliverei_store_slug', slug);
      }

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
          <h1 className="mb-4 text-xl font-semibold text-[#1F2937]">Entrar</h1>
          <form onSubmit={submit} className="space-y-4">
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
        </div>
      </div>
    </>
  );
}
