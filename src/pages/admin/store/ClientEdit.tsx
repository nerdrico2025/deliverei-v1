import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { StoreSidebar } from "../../../components/layout/StoreSidebar";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { useToast } from "../../../ui/feedback/ToastContext";

type Client = {
  id: string;
  nome: string;
  whatsapp: string;
  email?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  tags?: string[];
  status: "ativo" | "inativo";
};

export default function ClientEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState<Client>({
    id: id || "",
    nome: "",
    whatsapp: "",
    email: "",
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    uf: "",
    tags: [],
    status: "ativo",
  });

  useEffect(() => {
    setTimeout(() => {
      setModel((m) => ({
        ...m,
        nome: "Maria Silva",
        whatsapp: "(11) 99999-0000",
        email: "maria@email.com",
        cep: "01234-567",
        rua: "Rua das Flores",
        numero: "123",
        bairro: "Centro",
        cidade: "São Paulo",
        uf: "SP",
        tags: ["VIP", "Recorrente"],
      }));
      setLoading(false);
    }, 300);
  }, [id]);

  const onChange = (k: keyof Client, v: any) => setModel((m) => ({ ...m, [k]: v }));

  const onSave = async () => {
    push({ message: "Cliente salvo com sucesso!", tone: "success" });
    navigate("/admin/store/clients", { replace: true });
  };

  if (loading) {
    return (
      <DashboardShell sidebar={<StoreSidebar />}>
        <div className="text-[#4B5563]">Carregando cliente...</div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell sidebar={<StoreSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#111827]">Editar Cliente</h1>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Voltar
            </Button>
            <Button onClick={onSave}>Salvar</Button>
          </div>
        </div>

        <section className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">Informações Básicas</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-[#4B5563]">Nome</label>
              <Input
                placeholder="Nome completo"
                value={model.nome}
                onChange={(e) => onChange("nome", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[#4B5563]">WhatsApp</label>
              <Input
                placeholder="(11) 99999-9999"
                value={model.whatsapp}
                onChange={(e) => onChange("whatsapp", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[#4B5563]">E-mail</label>
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={model.email}
                onChange={(e) => onChange("email", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[#4B5563]">Status</label>
              <select
                className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
                value={model.status}
                onChange={(e) => onChange("status", e.target.value)}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">Endereço</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-[#4B5563]">CEP</label>
              <Input
                placeholder="00000-000"
                value={model.cep}
                onChange={(e) => onChange("cep", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[#4B5563]">Rua</label>
              <Input
                placeholder="Nome da rua"
                value={model.rua}
                onChange={(e) => onChange("rua", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[#4B5563]">Número</label>
              <Input
                placeholder="123"
                value={model.numero}
                onChange={(e) => onChange("numero", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[#4B5563]">Bairro</label>
              <Input
                placeholder="Nome do bairro"
                value={model.bairro}
                onChange={(e) => onChange("bairro", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[#4B5563]">Cidade</label>
              <Input
                placeholder="São Paulo"
                value={model.cidade}
                onChange={(e) => onChange("cidade", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[#4B5563]">UF</label>
              <Input
                placeholder="SP"
                value={model.uf}
                onChange={(e) => onChange("uf", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">Tags</h2>
          <div>
            <label className="mb-1 block text-sm text-[#4B5563]">
              Tags (separe por vírgula)
            </label>
            <Input
              placeholder="VIP, Recorrente, Premium"
              value={model.tags?.join(", ") || ""}
              onChange={(e) =>
                onChange(
                  "tags",
                  e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                )
              }
            />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
