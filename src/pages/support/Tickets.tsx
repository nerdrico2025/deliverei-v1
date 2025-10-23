import React, { useMemo, useState } from "react";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Badge } from "../../components/common/Badge";
import { X } from "lucide-react";

type Ticket = {
  id: string;
  empresa: string;
  titulo: string;
  status: "aberto" | "em_andamento" | "resolvido";
  prioridade: "baixa" | "media" | "alta";
  criadoEm: string;
  atribuido?: string;
};

export default function SupportTickets() {
  const [status, setStatus] = useState<"" | Ticket["status"]>("");
  const [q, setQ] = useState("");
  const [list, setList] = useState<Ticket[]>([
    { id: "t1", empresa: "Marmita Boa", titulo: "Erro no checkout", status: "aberto", prioridade: "alta", criadoEm: "2025-10-06 09:12" },
    { id: "t2", empresa: "Fit Express", titulo: "Dúvida de assinatura", status: "em_andamento", prioridade: "media", criadoEm: "2025-10-05 18:22", atribuido: "Suporte 2" },
    { id: "t3", empresa: "Delivery Top", titulo: "Integração WhatsApp", status: "aberto", prioridade: "baixa", criadoEm: "2025-10-06 08:30" },
  ]);
  const [drawer, setDrawer] = useState<{ open: boolean; ticket?: Ticket }>({ open: false });

  const filtered = useMemo(
    () =>
      list.filter(
        (t) =>
          (status ? t.status === status : true) &&
          (q ? (t.titulo + t.empresa).toLowerCase().includes(q.toLowerCase()) : true)
      ),
    [list, status, q]
  );

  const open = (t: Ticket) => setDrawer({ open: true, ticket: t });
  const close = () => setDrawer({ open: false });

  const takeTicket = (t: Ticket) => {
    setList((curr) => curr.map((x) => (x.id === t.id ? { ...x, atribuido: "Você", status: "em_andamento" as const } : x)));
  };

  const nextStatus = (t: Ticket) => {
    const order: Ticket["status"][] = ["aberto", "em_andamento", "resolvido"];
    const idx = order.indexOf(t.status);
    if (idx < 0 || idx >= order.length - 1) return;
    const n = order[idx + 1];
    setList((curr) => curr.map((x) => (x.id === t.id ? { ...x, status: n } : x)));
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-[#1F2937]">Tickets</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar por empresa/título"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="h-10 rounded-md border border-[#E5E7EB] px-3 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
          >
            <option value="">Todos</option>
            <option value="aberto">Aberto</option>
            <option value="em_andamento">Em andamento</option>
            <option value="resolvido">Resolvido</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-[#E5E7EB] bg-white">
        <table className="w-full min-w-[900px]">
          <thead className="bg-[#F9FAFB]">
            <tr>
              <th className="p-3 text-left text-sm text-[#4B5563]">Empresa</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Título</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Prioridade</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Status</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Atribuído</th>
              <th className="p-3 text-left text-sm text-[#4B5563]">Criado em</th>
              <th className="p-3 text-right text-sm text-[#4B5563]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-3">{t.empresa}</td>
                <td className="p-3">{t.titulo}</td>
                <td className="p-3">
                  <Badge
                    tone={
                      t.prioridade === "alta"
                        ? "error"
                        : t.prioridade === "media"
                        ? "warning"
                        : "muted"
                    }
                  >
                    {t.prioridade}
                  </Badge>
                </td>
                <td className="p-3 capitalize">{t.status.replace("_", " ")}</td>
                <td className="p-3">{t.atribuido || "—"}</td>
                <td className="p-3">{t.criadoEm}</td>
                <td className="p-3 text-right">
                  <button className="text-[#D22630] hover:underline mr-3" onClick={() => open(t)}>
                    Ver
                  </button>
                  {!t.atribuido && (
                    <button
                      className="text-[#FFC107] hover:underline mr-3"
                      onClick={() => takeTicket(t)}
                    >
                      Assumir
                    </button>
                  )}
                  <button className="text-[#16A34A] hover:underline" onClick={() => nextStatus(t)}>
                    Avançar
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-6 text-center text-[#4B5563]" colSpan={7}>
                  Nenhum ticket.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {drawer.open && drawer.ticket && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={close} />
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] p-4">
              <h3 className="text-lg font-semibold text-[#1F2937]">{drawer.ticket.titulo}</h3>
              <button onClick={close} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm text-[#4B5563]">
              <div>
                <span className="font-medium text-[#1F2937]">Empresa:</span> {drawer.ticket.empresa}
              </div>
              <div>
                <span className="font-medium text-[#1F2937]">Status:</span> {drawer.ticket.status}
              </div>
              <div>
                <span className="font-medium text-[#1F2937]">Prioridade:</span>{" "}
                {drawer.ticket.prioridade}
              </div>
              <div>
                <span className="font-medium text-[#1F2937]">Atribuído:</span>{" "}
                {drawer.ticket.atribuido || "—"}
              </div>
              <div className="rounded border border-dashed border-[#E5E7EB] p-4 text-[#4B5563]">
                Histórico de interações aparecerá aqui.
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  className="h-10 rounded-md border border-[#E5E7EB] px-3 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
                  placeholder="Responder..."
                />
                <Button>Enviar</Button>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
