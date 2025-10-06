import React, { useState } from "react";
import { PublicHeader } from "../../components/layout/PublicHeader";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoading(false);
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
        </div>
      </div>
    </>
  );
}
