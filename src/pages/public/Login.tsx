
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { PublicHeader } from "../../components/layout/PublicHeader";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../ui/feedback/ToastContext";

export default function Login() {
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

    // Direct redirect based on role - no delay
    if (user.role === "superadmin") {
      navigate("/admin/super", { replace: true });
    } else if (user.role === "empresa") {
      navigate("/admin/store", { replace: true });
    } else if (user.role === "suporte") {
      navigate("/support/tickets", { replace: true });
    } else {
      navigate("/storefront", { replace: true });
    }
  }, [user, navigate, location.state]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      push({ message: "Login realizado com sucesso!", tone: "success" });
      // Navigation will happen automatically via useEffect when user state updates
    } catch (error) {
      push({ message: "Erro ao fazer login. Tente novamente.", tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Deliverei | Login</title>
      </Helmet>
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
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[#4B5563]">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="text-right text-sm">
              <a className="text-[#D22630]" href="/forgot-password">
                Esqueci minha senha
              </a>
            </div>
            <Button type="submit" loading={loading} variant="primary" className="w-full">
              Entrar
            </Button>
          </form>
          <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
            <div className="font-semibold mb-1">Credenciais de teste:</div>
            <div>• Super Admin: admin@deliverei.com.br / admin123</div>
            <div>• Pizza Express: admin@pizza-express.com / pizza123</div>
            <div>• Burger King: admin@burger-king.com / pizza123</div>
            <div>• Cliente: cliente@exemplo.com / cliente123</div>
          </div>
        </div>
      </div>
    </>
  );
}
