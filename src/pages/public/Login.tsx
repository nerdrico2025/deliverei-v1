import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PublicHeader } from "../../components/layout/PublicHeader";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../ui/feedback/ToastContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      push({ message: "Login realizado com sucesso!", tone: "success" });

      const role = email.includes("+super")
        ? "superadmin"
        : email.includes("+suporte")
        ? "suporte"
        : "empresa";

      if (role === "superadmin") {
        navigate("/admin/super");
      } else if (role === "suporte") {
        navigate("/support/tickets");
      } else {
        navigate("/admin/store");
      }
    } catch (error) {
      push({ message: "Erro ao fazer login. Tente novamente.", tone: "error" });
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
            <div className="font-semibold mb-1">Teste os perfis:</div>
            <div>• Empresa: qualquer@email.com</div>
            <div>• SuperAdmin: admin+super@email.com</div>
            <div>• Suporte: agente+suporte@email.com</div>
          </div>
        </div>
      </div>
    </>
  );
}
