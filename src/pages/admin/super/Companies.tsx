

import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { SuperAdminSidebar } from "../../../components/layout/SuperAdminSidebar";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Badge } from "../../../components/common/Badge";
import { useAuth } from "../../../auth/AuthContext";
import { useToast } from "../../../ui/feedback/ToastContext";
import { X, Copy, Check } from "lucide-react";

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
  senha: string;
  confirmarSenha: string;
};

type CreatedCompanyInfo = {
  empresaId: string;
  email: string;
  senha: string;
  nome: string;
} | null;

// Initial mock companies
const INITIAL_COMPANIES: Company[] = [
  { id: "1", nome: "Marmita Boa", plano: "Pro", status: "ativo", dataCriacao: "2025-08-15", empresaId: "marmita-boa" },
  { id: "2", nome: "Fit Express", plano: "Basic", status: "ativo", dataCriacao: "2025-09-01", empresaId: "fit-express" },
  { id: "3", nome: "Delivery Top", plano: "Pro", status: "trial", dataCriacao: "2025-10-01", empresaId: "delivery-top" },
  { id: "4", nome: "Sabor da Casa", plano: "Basic", status: "inativo", dataCriacao: "2025-07-10", empresaId: "sabor-da-casa" },
  { id: "5", nome: "Pizza Express", plano: "Pro", status: "ativo", dataCriacao: "2025-10-06", empresaId: "pizza-express" },
  { id: "6", nome: "Burger King", plano: "Pro", status: "ativo", dataCriacao: "2025-10-06", empresaId: "burger-king" },
];

// Helper function to generate unique empresaId
const generateUniqueEmpresaId = (nome: string, existingIds: string[]): string => {
  // Create base slug from company name
  let baseSlug = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

  // If slug is empty, use default
  if (!baseSlug) {
    baseSlug = "empresa";
  }

  // Check if base slug is unique
  if (!existingIds.includes(baseSlug)) {
    return baseSlug;
  }

  // If not unique, append timestamp and random string
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${timestamp}${random}`;
};

export default function CompaniesPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | Company["status"]>("");
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdCompanyInfo, setCreatedCompanyInfo] = useState<CreatedCompanyInfo>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
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
    senha: "",
    confirmarSenha: "",
  });

  // CRITICAL FIX: Initialize companies from localStorage or use defaults
  const [list, setList] = useState<Company[]>(() => {
    const stored = localStorage.getItem("deliverei_companies");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge with initial companies (in case new ones were added)
        const existingIds = parsed.map((c: Company) => c.empresaId);
        const newCompanies = INITIAL_COMPANIES.filter(c => !existingIds.includes(c.empresaId));
        return [...parsed, ...newCompanies];
      } catch {
        return INITIAL_COMPANIES;
      }
    }
    return INITIAL_COMPANIES;
  });

  // Save to localStorage and notify other components whenever list changes
  // NOTE: This component does NOT listen to its own events to prevent infinite loops
  // Only other components (like Subscriptions.tsx) should listen to "companies-updated"
  useEffect(() => {
    localStorage.setItem("deliverei_companies", JSON.stringify(list));
    // Dispatch event to notify other components (but don't listen to it ourselves!)
    window.dispatchEvent(new CustomEvent("companies-updated"));
  }, [list]);

  // State to manage subscriptions (shared with Subscriptions page via localStorage for demo)
  const getSubscriptions = () => {
    const stored = localStorage.getItem("deliverei_subscriptions");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  };

  const saveSubscriptions = (subs: any[]) => {
    localStorage.setItem("deliverei_subscriptions", JSON.stringify(subs));
    // Dispatch custom event to notify Subscriptions page
    window.dispatchEvent(new CustomEvent("subscriptions-updated"));
  };

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
      senha: "",
      confirmarSenha: "",
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
      senha: "",
      confirmarSenha: "",
    });
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setCreatedCompanyInfo(null);
    setCopiedField(null);
  };

  const handleInputChange = (field: keyof NovaEmpresaForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCopyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      push({ message: "Erro ao copiar", tone: "error" });
    }
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
    if (!formData.senha.trim()) {
      push({ message: "Senha é obrigatória", tone: "error" });
      return false;
    }
    if (formData.senha.length < 6) {
      push({ message: "Senha deve ter no mínimo 6 caracteres", tone: "error" });
      return false;
    }
    if (formData.senha !== formData.confirmarSenha) {
      push({ message: "As senhas não coincidem", tone: "error" });
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
      
      // Generate unique empresaId
      const existingIds = list.map(c => c.empresaId).filter(Boolean) as string[];
      const empresaId = generateUniqueEmpresaId(formData.nome, existingIds);
      
      // Create new company
      const newCompany: Company = {
        id: String(Date.now()), // Use timestamp for unique ID
        nome: formData.nome,
        plano: formData.plano,
        status: formData.status,
        dataCriacao: new Date().toISOString().split('T')[0],
        empresaId,
      };
      
      // CRITICAL FIX: Update list state which will trigger localStorage save via useEffect
      setList(prev => [...prev, newCompany]);
      
      // CRITICAL FIX: Create subscription entry for the new company
      const currentDate = new Date();
      const nextBillingDate = new Date(currentDate);
      nextBillingDate.setDate(nextBillingDate.getDate() + 30);
      
      const newSubscription = {
        id: `sub_${empresaId}_${Date.now()}`,
        empresa: formData.nome,
        empresaId: empresaId,
        plano: formData.plano,
        status: formData.status === "ativo" ? "ativo" : "inativo",
        dataInicio: currentDate.toISOString().split('T')[0],
        proxCobranca: formData.status === "ativo" ? nextBillingDate.toISOString().split('T')[0] : undefined,
      };
      
      // Get existing subscriptions and add new one
      const existingSubscriptions = getSubscriptions();
      saveSubscriptions([...existingSubscriptions, newSubscription]);
      
      // Store company credentials (for demo purposes - in production, this would be handled securely)
      const credentials = {
        empresaId,
        email: formData.email,
        senha: formData.senha,
        nome: formData.nome,
      };
      
      // Save credentials to localStorage (for demo)
      const existingCredentials = JSON.parse(localStorage.getItem("deliverei_credentials") || "[]");
      existingCredentials.push(credentials);
      localStorage.setItem("deliverei_credentials", JSON.stringify(existingCredentials));
      
      // Set created company info for success modal
      setCreatedCompanyInfo(credentials);
      
      push({ message: "Empresa e assinatura criadas com sucesso!", tone: "success" });
      handleCloseModal();
      setShowSuccessModal(true);
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
                <p className="text-xs text-gray-500 mt-1">
                  Este email será usado pelo admin da loja para fazer login
                </p>
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
                  Senha Inicial *
                </label>
                <Input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => handleInputChange('senha', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Esta senha será usada pelo admin da loja para fazer login
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha *
                </label>
                <Input
                  type="password"
                  value={formData.confirmarSenha}
                  onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                  placeholder="Digite a senha novamente"
                  required
                  minLength={6}
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

      {/* Success Modal with Credentials */}
      {showSuccessModal && createdCompanyInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Empresa Criada com Sucesso! 🎉</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 mb-2">
                  <strong>Importante:</strong> Anote ou copie as credenciais abaixo. O admin da loja precisará delas para fazer login.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Empresa
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 bg-gray-50 rounded border border-gray-200 font-mono text-sm">
                    {createdCompanyInfo.nome}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID da Empresa (Slug)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 bg-gray-50 rounded border border-gray-200 font-mono text-sm">
                    {createdCompanyInfo.empresaId}
                  </div>
                  <button
                    onClick={() => handleCopyToClipboard(createdCompanyInfo.empresaId, 'empresaId')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                    title="Copiar"
                  >
                    {copiedField === 'empresaId' ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de Login
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 bg-gray-50 rounded border border-gray-200 font-mono text-sm">
                    {createdCompanyInfo.email}
                  </div>
                  <button
                    onClick={() => handleCopyToClipboard(createdCompanyInfo.email, 'email')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                    title="Copiar"
                  >
                    {copiedField === 'email' ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 bg-gray-50 rounded border border-gray-200 font-mono text-sm">
                    {createdCompanyInfo.senha}
                  </div>
                  <button
                    onClick={() => handleCopyToClipboard(createdCompanyInfo.senha, 'senha')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                    title="Copiar"
                  >
                    {copiedField === 'senha' ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Próximos passos:</strong>
                </p>
                <ol className="text-sm text-blue-800 mt-2 ml-4 list-decimal space-y-1">
                  <li>Envie as credenciais acima para o admin da loja</li>
                  <li>O admin deve acessar a página de login</li>
                  <li>Fazer login com o email e senha fornecidos</li>
                  <li>Recomende trocar a senha no primeiro acesso</li>
                </ol>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  onClick={handleCloseSuccessModal}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
