
import React, { useMemo, useState, useEffect } from "react";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { SuperAdminSidebar } from "../../../components/layout/SuperAdminSidebar";
import { Input } from "../../../components/common/Input";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useToast } from "../../../ui/feedback/ToastContext";
import { X } from "lucide-react";

type Sub = {
  id: string;
  empresa: string;
  empresaId?: string;
  plano: string;
  status: "ativo" | "inativo" | "atrasado" | "cancelado";
  dataInicio?: string;
  proxCobranca?: string;
};

type ModalType = "alterarPlano" | "cancelar" | null;

// Initial mock subscriptions
const INITIAL_SUBSCRIPTIONS: Sub[] = [
  { id: "s1", empresa: "Marmita Boa", empresaId: "marmita-boa", plano: "Pro", status: "ativo", dataInicio: "2025-08-15", proxCobranca: "2025-11-05" },
  { id: "s2", empresa: "Fit Express", empresaId: "fit-express", plano: "Basic", status: "atrasado", dataInicio: "2025-09-01", proxCobranca: "2025-10-01" },
  { id: "s3", empresa: "Delivery Top", empresaId: "delivery-top", plano: "Pro", status: "ativo", dataInicio: "2025-10-01", proxCobranca: "2025-11-01" },
  { id: "s4", empresa: "Sabor da Casa", empresaId: "sabor-da-casa", plano: "Basic", status: "cancelado", dataInicio: "2025-07-10" },
  { id: "s5", empresa: "Pizza Express", empresaId: "pizza-express", plano: "Pro", status: "ativo", dataInicio: "2025-10-06", proxCobranca: "2025-11-06" },
  { id: "s6", empresa: "Burger King", empresaId: "burger-king", plano: "Pro", status: "ativo", dataInicio: "2025-10-06", proxCobranca: "2025-11-06" },
];

export default function SubscriptionsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | Sub["status"]>("");
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedSub, setSelectedSub] = useState<Sub | null>(null);
  const [newPlano, setNewPlano] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  // Initialize subscriptions from localStorage or use defaults
  const [list, setList] = useState<Sub[]>(() => {
    const stored = localStorage.getItem("deliverei_subscriptions");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge with initial subscriptions (in case new ones were added)
        const existingIds = parsed.map((s: Sub) => s.empresaId);
        const newSubs = INITIAL_SUBSCRIPTIONS.filter(s => !existingIds.includes(s.empresaId));
        return [...parsed, ...newSubs];
      } catch {
        return INITIAL_SUBSCRIPTIONS;
      }
    }
    return INITIAL_SUBSCRIPTIONS;
  });

  // Listen for subscription updates from Companies page
  useEffect(() => {
    const handleSubscriptionsUpdate = () => {
      const stored = localStorage.getItem("deliverei_subscriptions");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setList(parsed);
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener("subscriptions-updated", handleSubscriptionsUpdate);
    return () => window.removeEventListener("subscriptions-updated", handleSubscriptionsUpdate);
  }, []);

  // Save to localStorage whenever list changes
  useEffect(() => {
    localStorage.setItem("deliverei_subscriptions", JSON.stringify(list));
  }, [list]);

  const filtered = useMemo(
    () =>
      list.filter(
        (s) =>
          (status ? s.status === status : true) &&
          (q ? s.empresa.toLowerCase().includes(q.toLowerCase()) : true)
      ),
    [list, q, status]
  );

  const handleOpenAlterarPlano = (sub: Sub) => {
    setSelectedSub(sub);
    setNewPlano(sub.plano);
    setModalType("alterarPlano");
  };

  const handleOpenCancelar = (sub: Sub) => {
    setSelectedSub(sub);
    setModalType("cancelar");
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedSub(null);
    setNewPlano("");
  };

  const handleAlterarPlano = async () => {
    if (!selectedSub || !newPlano) return;

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update subscription plan
      setList(prev => 
        prev.map(sub => 
          sub.id === selectedSub.id 
            ? { ...sub, plano: newPlano }
            : sub
        )
      );
      
      push({ message: `Plano alterado para ${newPlano} com sucesso!`, tone: "success" });
      handleCloseModal();
    } catch (error) {
      push({ message: "Erro ao alterar plano", tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async () => {
    if (!selectedSub) return;

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Cancel subscription
      setList(prev => 
        prev.map(sub => 
          sub.id === selectedSub.id 
            ? { ...sub, status: "cancelado", proxCobranca: undefined }
            : sub
        )
      );
      
      push({ message: "Assinatura cancelada com sucesso!", tone: "success" });
      handleCloseModal();
    } catch (error) {
      push({ message: "Erro ao cancelar assinatura", tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell sidebar={<SuperAdminSidebar />}>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-[#1F2937]">Assinaturas</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar por empresa"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="h-10 rounded-md border border-[#E5E7EB] px-3 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
          >
            <option value="">Todos</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="atrasado">Atrasado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Subscription Counter */}
      <div className="mb-3 text-sm text-[#4B5563]">
        {filtered.length} {filtered.length === 1 ? 'assinatura' : 'assinaturas'}
      </div>

      <div className="overflow-x-auto rounded-md border border-[#E5E7EB] bg-white">
        <table className="w-full min-w-[800px]">
          <thead className="bg-[#F9FAFB]">
            <tr>
              <th className="p-3 text-left text-sm text-[#4B5563]">Empresa</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Plano</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Status</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Data de início</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Próxima cobrança</th>
              <th className="p-3 text-right text-sm text-[#4B5563]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{s.empresa}</td>
                <td className="p-3">{s.plano}</td>
                <td className="p-3">
                  <Badge
                    tone={
                      s.status === "ativo"
                        ? "success"
                        : s.status === "atrasado"
                        ? "warning"
                        : "muted"
                    }
                  >
                    {s.status}
                  </Badge>
                </td>
                <td className="p-3">{s.dataInicio || "—"}</td>
                <td className="p-3">{s.proxCobranca || "—"}</td>
                <td className="p-3 text-right">
                  <button 
                    onClick={() => handleOpenAlterarPlano(s)}
                    className="text-[#D22630] hover:underline mr-3"
                    disabled={s.status === "cancelado"}
                  >
                    Alterar plano
                  </button>
                  <button 
                    onClick={() => handleOpenCancelar(s)}
                    className="text-[#DC2626] hover:underline"
                    disabled={s.status === "cancelado"}
                  >
                    Cancelar
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-6 text-center text-[#4B5563]" colSpan={6}>
                  Nenhuma assinatura.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Alterar Plano Modal */}
      {modalType === "alterarPlano" && selectedSub && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Alterar Plano</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Empresa:</p>
                <p className="font-semibold text-gray-900">{selectedSub.empresa}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Plano Atual:</p>
                <p className="font-semibold text-gray-900">{selectedSub.plano}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Novo Plano *
                </label>
                <select
                  value={newPlano}
                  onChange={(e) => setNewPlano(e.target.value)}
                  className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
                >
                  <option value="Basic">Basic</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
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
                  type="button"
                  onClick={handleAlterarPlano}
                  loading={loading}
                  disabled={loading || newPlano === selectedSub.plano}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancelar Modal */}
      {modalType === "cancelar" && selectedSub && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Cancelar Assinatura</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Atenção:</strong> Esta ação não pode ser desfeita. A assinatura será cancelada imediatamente.
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Empresa:</p>
                <p className="font-semibold text-gray-900">{selectedSub.empresa}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Plano:</p>
                <p className="font-semibold text-gray-900">{selectedSub.plano}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Status Atual:</p>
                <Badge
                  tone={
                    selectedSub.status === "ativo"
                      ? "success"
                      : selectedSub.status === "atrasado"
                      ? "warning"
                      : "muted"
                  }
                >
                  {selectedSub.status}
                </Badge>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCloseModal}
                >
                  Voltar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleCancelar}
                  loading={loading}
                  disabled={loading}
                >
                  Confirmar Cancelamento
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
