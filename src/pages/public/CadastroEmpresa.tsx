import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PublicHeader } from "../../components/layout/PublicHeader";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { useToast } from "../../ui/feedback/ToastContext";
import { Building2, User } from "lucide-react";
import apiClient from "../../services/apiClient";
// Removed supabase client import; we will call the Edge Function directly via fetch
// import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../auth/AuthContext";
import { authApi } from "../../services/backendApi";
import { persistTenantSlug } from "../../services/api.utils";

interface CadastroEmpresaForm {
  // Dados da empresa
  nomeEmpresa: string;
  slug: string;
  telefoneEmpresa: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  
  // Dados do usuário admin
  nomeAdmin: string;
  emailAdmin: string;
  senhaAdmin: string;
  confirmarSenha: string;
}

export default function CadastroEmpresa() {
  const navigate = useNavigate();
  const { error, success } = useToast();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CadastroEmpresaForm>({
    nomeEmpresa: "",
    slug: "",
    telefoneEmpresa: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    nomeAdmin: "",
    emailAdmin: "",
    senhaAdmin: "",
    confirmarSenha: "",
  });

  const handleInputChange = (field: keyof CadastroEmpresaForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-gerar slug baseado no nome da empresa
    if (field === "nomeEmpresa") {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
        .replace(/\s+/g, "-") // Substitui espaços por hífens
        .replace(/-+/g, "-") // Remove hífens duplicados
        .replace(/^-|-$/g, ""); // Remove hífens do início e fim
      
      setFormData(prev => ({
        ...prev,
        slug: slug
      }));
    }
  };

  const validateForm = (): string | null => {
    if (!formData.nomeEmpresa.trim()) return "Nome da empresa é obrigatório";
    if (!formData.slug.trim()) return "Slug da empresa é obrigatório";
    if (!formData.telefoneEmpresa.trim()) return "Telefone da empresa é obrigatório";
    if (!formData.endereco.trim()) return "Endereço é obrigatório";
    if (!formData.cidade.trim()) return "Cidade é obrigatória";
    if (!formData.estado.trim()) return "Estado é obrigatório";
    if (!formData.cep.trim()) return "CEP é obrigatório";
    
    if (!formData.nomeAdmin.trim()) return "Nome do administrador é obrigatório";
    if (!formData.emailAdmin.trim()) return "Email do administrador é obrigatório";
    if (!formData.senhaAdmin.trim()) return "Senha é obrigatória";
    if (formData.senhaAdmin.length < 6) return "Senha deve ter pelo menos 6 caracteres";
    if (formData.senhaAdmin !== formData.confirmarSenha) return "Senhas não coincidem";

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.emailAdmin)) return "Email inválido";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      error(validationError);
      return;
    }

    setLoading(true);

    try {
      // Preparar dados para envio
      const cadastroData = {
        // Dados da empresa
        nomeEmpresa: formData.nomeEmpresa,
        slug: formData.slug,
        telefoneEmpresa: formData.telefoneEmpresa || undefined,
        endereco: formData.endereco,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep,
        
        // Dados do admin
        nomeAdmin: formData.nomeAdmin,
        emailAdmin: formData.emailAdmin,
        senhaAdmin: formData.senhaAdmin,
        telefoneAdmin: formData.telefoneEmpresa || undefined,
      };

      const useSupabase = import.meta.env.PROD && import.meta.env.VITE_USE_SUPABASE === 'true';

      if (useSupabase) {
        // Direct call to the deployed Edge Function; include Authorization header with anon key
        const fnUrl = import.meta.env.VITE_SUPABASE_FUNCTION_URL || 'https://hmlxtjcgkbzczwsjvdvl.supabase.co/functions/v1/cadastro-empresa';
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
        const res = await fetch(fnUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(anonKey ? { Authorization: `Bearer ${anonKey}` } : {}),
          },
          body: JSON.stringify(cadastroData),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw { response: { status: res.status, data } };
        }
      } else {
        // Chamar API de cadastro de empresa (backend atual)
        await apiClient.post('/auth/cadastro-empresa', cadastroData, { timeout: 10000 });
      }
      
      // Auto-login após cadastro bem sucedido
      success("Empresa cadastrada com sucesso! Entrando na sua conta...");

      try {
        const response = await authApi.login({
          email: formData.emailAdmin,
          senha: formData.senhaAdmin,
        });

        // Persistir tokens e slug retornados
        if (response?.accessToken) {
          localStorage.setItem('deliverei_token', response.accessToken);
        }
        if (response?.refreshToken) {
          localStorage.setItem('deliverei_refresh_token', response.refreshToken);
        }
        const slug = response?.empresa?.slug || formData.slug;
        if (slug) {
          persistTenantSlug(slug);
        }

        // Persistir nome e telefone da empresa para hidratação do app
        const companyName = response?.empresa?.nome || formData.nomeEmpresa;
        if (companyName) {
          localStorage.setItem('deliverei_company_name', companyName);
        }
        if (formData.telefoneEmpresa) {
          localStorage.setItem('deliverei_company_phone', formData.telefoneEmpresa);
        }

        // Persistir responsável e endereço para hidratação em Settings
        if (formData?.nomeAdmin) localStorage.setItem('deliverei_responsavel_nome', formData.nomeAdmin);
        if (formData?.emailAdmin) localStorage.setItem('deliverei_responsavel_email', formData.emailAdmin);
        if (formData?.telefoneEmpresa) localStorage.setItem('deliverei_responsavel_telefone', formData.telefoneEmpresa);
        if (formData?.endereco) localStorage.setItem('deliverei_company_address', formData.endereco);
        if (formData?.cidade) localStorage.setItem('deliverei_company_city', formData.cidade);
        if (formData?.estado) localStorage.setItem('deliverei_company_state', formData.estado);
        if (formData?.cep) localStorage.setItem('deliverei_company_zip', formData.cep);

        // Atualizar contexto e redirecionar
        await login(formData.emailAdmin, formData.senhaAdmin);
        navigate("/admin/store", { replace: true });
      } catch (loginErr) {
        // Não iniciar sessão mock/offline. Exigir confirmação de login real.
        const msg = (loginErr?.response?.data?.message) || "Falha ao iniciar sessão após cadastro. Tente fazer login novamente com suas credenciais.";
        error(msg);
        return; // interrompe o fluxo se login falhar
      }

    } catch (err: any) {
      console.error("[CadastroEmpresa] Erro ao cadastrar empresa:", err);
      
      let errorMessage = "Erro ao cadastrar empresa. Tente novamente.";
      const baseURL = (apiClient.defaults?.baseURL || "");

      // Network-level errors (sem resposta)
      if (!err?.response) {
        errorMessage = "Falha de conexão com a API/Função. Verifique se o backend ou Supabase Function está acessível e se variáveis de ambiente estão corretas.";
        if (baseURL.includes("3001")) {
          errorMessage += " Atenção: a URL da API aponta para :3001. Ajuste VITE_API_URL para http://localhost:3002/api e reinicie o frontend.";
        }
      } else {
        const status = err.response.status;
        const serverMessage = Array.isArray(err.response.data?.message)
          ? err.response.data.message.join(", ")
          : err.response.data?.message;

        if (status === 400 || status === 409) {
          if (typeof serverMessage === "string") {
            if (/email.*cadastrado/i.test(serverMessage)) {
              errorMessage = "Este email já está cadastrado.";
            } else if (/slug.*(em uso|indisponível)/i.test(serverMessage)) {
              errorMessage = "Este slug já está em uso. Tente outro.";
            } else {
              errorMessage = serverMessage;
            }
          } else {
            errorMessage = "Dados inválidos. Verifique os campos e tente novamente.";
          }
        } else if (status >= 500) {
          errorMessage = "Erro no servidor. Tente novamente mais tarde.";
        } else {
          errorMessage = serverMessage || errorMessage;
        }
      }
      
      error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Building2 className="mx-auto h-12 w-12 text-[#D22630]" />
            <h1 className="mt-4 text-3xl font-bold text-[#1F2937]">
              Cadastre sua Empresa
            </h1>
            <p className="mt-2 text-[#4B5563]">
              Crie sua conta e comece a vender com o Deliverei
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Dados da Empresa */}
              <div>
                <h2 className="text-lg font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Dados da Empresa
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#4B5563] mb-1">
                      Nome da Empresa *
                    </label>
                    <Input
                      type="text"
                      value={formData.nomeEmpresa}
                      onChange={(e) => handleInputChange("nomeEmpresa", e.target.value)}
                      placeholder="Ex: Pizzaria do João"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#4B5563] mb-1">
                      Site da sua loja *
                    </label>
                    <div className="flex items-center border border-[#E5E7EB] rounded-lg overflow-hidden">
                      <span className="bg-gray-50 px-3 py-2 text-sm text-[#6B7280] border-r border-[#E5E7EB]">
                        deliverei.com.br/loja/
                      </span>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleInputChange("slug", e.target.value)}
                        placeholder="pizzaria-do-joao"
                        required
                        disabled={loading}
                        className="flex-1 px-3 py-2 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-[#D22630] disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1">
                      Este será o endereço da sua loja: deliverei.com.br/loja/{formData.slug || "seu-slug"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4B5563] mb-1">
                      Telefone da Empresa *
                    </label>
                    <Input
                      type="tel"
                      value={formData.telefoneEmpresa}
                      onChange={(e) => handleInputChange("telefoneEmpresa", e.target.value)}
                      placeholder="(11) 99999-9999"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4B5563] mb-1">
                      CEP *
                    </label>
                    <Input
                      type="text"
                      value={formData.cep}
                      onChange={(e) => handleInputChange("cep", e.target.value)}
                      placeholder="00000-000"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#4B5563] mb-1">
                      Endereço *
                    </label>
                    <Input
                      type="text"
                      value={formData.endereco}
                      onChange={(e) => handleInputChange("endereco", e.target.value)}
                      placeholder="Rua, número, bairro"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4B5563] mb-1">
                      Cidade *
                    </label>
                    <Input
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => handleInputChange("cidade", e.target.value)}
                      placeholder="São Paulo"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4B5563] mb-1">
                      Estado *
                    </label>
                    <Input
                      type="text"
                      value={formData.estado}
                      onChange={(e) => handleInputChange("estado", e.target.value)}
                      placeholder="SP"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Dados do Administrador */}
              <div>
                <h2 className="text-lg font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados do Administrador
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4B5563] mb-1">
                      Nome Completo *
                    </label>
                    <Input
                      type="text"
                      value={formData.nomeAdmin}
                      onChange={(e) => handleInputChange("nomeAdmin", e.target.value)}
                      placeholder="João Silva"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#4B5563] mb-1">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.emailAdmin}
                      onChange={(e) => handleInputChange("emailAdmin", e.target.value)}
                      placeholder="joao@pizzariadojoao.com"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4B5563] mb-1">
                      Senha *
                    </label>
                    <Input
                      type="password"
                      value={formData.senhaAdmin}
                      onChange={(e) => handleInputChange("senhaAdmin", e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4B5563] mb-1">
                      Confirmar Senha *
                    </label>
                    <Input
                      type="password"
                      value={formData.confirmarSenha}
                      onChange={(e) => handleInputChange("confirmarSenha", e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  disabled={loading}
                  className="sm:w-auto"
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={loading}
                  className="flex-1 sm:flex-none"
                >
                  Cadastrar Empresa
                </Button>
              </div>
            </form>
          </div>

          {/* Informações adicionais */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[#6B7280]">
              Já tem uma conta?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-[#D22630] hover:text-[#A01D26] font-medium"
              >
                Faça login
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}