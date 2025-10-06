import React, { useState } from "react";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { SuperAdminSidebar } from "../../../components/layout/SuperAdminSidebar";
import { Input } from "../../../components/common/Input";
import { Button } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import { useToast } from "../../../ui/feedback/ToastContext";

export default function SuperSettings() {
  const { push } = useToast();
  const [settings, setSettings] = useState({
    whatsappSupport: "+55 11 9999-9999",
    storeDomain: "loja.deliverei.com",
    webhookUrl: "https://n8n.deliverei.com/webhook/default",
    apiKey: "sk_live_xxxxxxxxxxxxx",
  });

  const handleSave = () => {
    push({ message: "Configurações salvas com sucesso!", tone: "success" });
  };

  return (
    <DashboardShell sidebar={<SuperAdminSidebar />}>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-[#111827]">Configurações do Sistema</h1>

        <section className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">Parâmetros Globais</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-[#4B5563]">
                WhatsApp Suporte Global
              </label>
              <Input
                value={settings.whatsappSupport}
                onChange={(e) => setSettings({ ...settings, whatsappSupport: e.target.value })}
                placeholder="+55 11 9999-9999"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[#4B5563]">
                Domínio das Vitrines
              </label>
              <Input
                value={settings.storeDomain}
                onChange={(e) => setSettings({ ...settings, storeDomain: e.target.value })}
                placeholder="loja.seudominio.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[#4B5563]">
                Webhook N8N Padrão
              </label>
              <Input
                value={settings.webhookUrl}
                onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                placeholder="https://n8n.example.com/webhook/default"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[#4B5563]">
                Chave API Interna (Somente Leitura)
              </label>
              <Input
                value={settings.apiKey}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                placeholder="sk_live_xxxxxxxxxxxxx"
                type="password"
              />
            </div>
          </div>
          <div className="mt-5">
            <Button onClick={handleSave}>Salvar Configurações</Button>
          </div>
        </section>

        <section className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-[#1F2937]">Informações do Sistema</h2>
          <div className="grid gap-2 text-sm text-[#4B5563] md:grid-cols-2">
            <div className="flex justify-between">
              <span className="text-[#4B5563]">Versão do Sistema:</span>
              <span className="font-medium text-[#1F2937]">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#4B5563]">Ambiente:</span>
              <span className="font-medium text-[#1F2937]">Produção</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#4B5563]">Última Atualização:</span>
              <span className="font-medium text-[#1F2937]">2025-10-06</span>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
