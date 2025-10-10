
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { SuperAdminSidebar } from "../../../components/layout/SuperAdminSidebar";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Badge } from "../../../components/common/Badge";
import { useAuth } from "../../../auth/AuthContext";
import { useToast } from "../../../ui/feedback/ToastContext";
import { X } from "lucide-react";

type Company = {
  id: string;
  nome: string;
  plano: string;
  status: "ativo" | "inativo" | "trial";
  dataCriacao: string;
  empresaId?: string;
};

type NovaEmpresaForm = {
  nome: string;
  email: string;
  telefone: string;
  plano: "Basic" | "Pro" | "Enterprise";
  status: "ativo" | "inativo";
};

export default function CompaniesPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | Company["status"]>("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { impersonate } = useAuth();
  const { push } = useToast();
  
  const [formData, setFormData] = useState<NovaEmpresaForm>({
    nome: "",
    email: "",
    telefone: "",
    plano: "Basic",
    status: "ativo",
  });

  const [list, setList] = useState<Company[]>([
    { id: "1", nome: "Marmita Boa", plano: "Pro", status: "ativo", dataCriacao: "2025-08-15", empresaId: "marmita-boa" },
    { id: "2", nome: "Fit Express", plano: "Basic", status: "ativo", dataCriacao: "2025-09-01", empresaId: "fit-express" },
    { id: "3", nome: "Delivery Top", plano: "Pro", status: "trial", dataCriacao: "2025-10-01", empresaId: "delivery-top" },
    { id: "4", nome: "Sabor da Casa", plano: "Basic", status: "inativo", dataCriacao: "2025-07-10", empresaId: "sabor-da-casa" },
    { id: "5", nome: "Pizza Express", plano: "Pro", status: "ativo", dataCriacao: "2025-10-06", empresaId: "pizza-express" },
    { id: "6", nome: "Burger King", plano: "Pro", status: "ativo", dataCriacao: "2025-10-06", empresaId: "burger-king" },
  ]);

  const filtered = useMemo(
    () =>
      list.filter(
        (c) =>
          (status ? c.status === status : true) &&
          (q ? c.nome.toLowerCase().includes(q.toLowerCase()) : true)
      ),
    [list, q, status]
  );

  const handleViewDetails = (company: Company) => {
    if (!company.empresaId) {
      push({ message: "Empresa não possui ID válido", tone: "error" });
      return;
    }
    
    // Store the company slug for backend API calls
    localStorage.setItem("deliverei_store_slug", company.empresaId);
    
    // Impersonate the company
    impersonate(company.empresaId, company.nome);
    
    // Navigate to the company's admin dashboard
    navigate("/admin/store");
  };

  const handleOpenModal = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      plano: "Basic",
      status: "ativo",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      plano: "Basic",
      status: "ativo",
    });
  };

  const handleInputChange = (field: keyof NovaEmpresaForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.nome.trim()) {
      push({ message: "Nome da empresa é obrigatório", tone: "error" });
      return false;
    }
    if (!formData.email.trim()) {
      push({ message: "Email é obrigatório", tone: "error" });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      push({ message: "Email inválido", tone: "error" });
      return false;
    }
    if (!formData.telefone.trim()) {
      push({ message: "Telefone é obrigatório", tone: "error" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new company
      const newCompany: Company = {
        id: String(list.length + 1),
        nome: formData.nome,
        plano: formData.plano,
        status: formData.status,
        dataCriacao: new Date().toISOString().split('T')[0],
        empresaId: formData.nome.toLowerCase().replace(/\s+/g, '-'),
      };
      
      setList(prev => [...prev, newCompany]);
      push({ message: "Empresa criada com sucesso!", tone: "success" });
      handleCloseModal();
    } catch (error) {
      push({ message: "Erro ao criar empresa", tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell sidebar={<SuperAdminSidebar />}>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-[#1F2937]">Empresas</h1>
        <div className="flex gap-2">
          <Input placeholder="Buscar por nome" value={q} onChange={(e) => setQ(e.target.value)} />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="h-10 rounded-md border border-[#E5E7EB] px-3 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
          >
            <option value="">Todos</option>
            <option value="ativo">Ativo</option>
            <option value="trial">Trial</option>
            <option value="inativo">Inativo</option>
          </select>
          <Button onClick={handleOpenModal}>Nova Empresa</Button>
        </div>
      </div>

      {/* Company Counter */}
      <div className="mb-3 text-sm text-[#4B5563]">
        {filtered.length} {filtered.length === 1 ? 'empresa' : 'empresas'}
      </div>

      <div className="overflow-x-auto rounded-md border border-[#E5E7EB] bg-white">
        <table className="w-full min-w-[800px]">
          <thead className="bg-[#F9FAFB]">
            <tr>
              <th className="p-3 text-left text-sm text-[#4B5563]">Nome</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Plano</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Status</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Data de criação</th>
              <th className="p-3 text-right text-sm text-[#4B5563]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-medium text-[#1F2937]">{c.nome}</td>
                <td className="p-3">{c.plano}</td>
                <td className="p-3">
                  <Badge
                    tone={
                      c.status === "ativo"
                        ? "success"
                        : c.status === "trial"
                        ? "warning"
                        : "muted"
                    }
                  >
                    {c.status}
                  </Badge>
                </td>
                <td className="p-3">{c.dataCriacao}</td>
                <td className="p-3 text-right">
                  <button 
                    onClick={() => handleViewDetails(c)}
                    className="text-[#D22630] hover:underline"
                  >
                    Ver detalhes
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-6 text-center text-[#4B5563]" colSpan={5}>
                  Nenhuma empresa encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Nova Empresa Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Nova Empresa</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Empresa *
                </label>
                <Input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Ex: Marmita Boa"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email do Admin *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="admin@empresa.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <Input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plano *
                </label>
                <select
                  value={formData.plano}
                  onChange={(e) => handleInputChange('plano', e.target.value)}
                  className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
                  required
                >
                  <option value="Basic">Basic</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
                  required
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCloseModal}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  Criar Empresa
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
