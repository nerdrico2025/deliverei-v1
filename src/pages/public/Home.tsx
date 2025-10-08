import React from "react";
import { PublicHeader } from "../../components/layout/PublicHeader";
import { Button } from "../../components/common/Button";

export default function Home() {
  return (
    <>
      <PublicHeader />
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
          <div>
            <h1 className="mb-4 text-3xl font-bold text-[#1F2937]">
              Gestão de delivery de marmitas, simples e completa
            </h1>
            <p className="mb-6 text-[#4B5563]">
              Crie sua vitrine, receba pedidos e automatize o WhatsApp com poucos cliques.
            </p>
            <div className="flex gap-3">
              <a href="/login-backend">
                <Button variant="primary">Testar com Backend Real</Button>
              </a>
              <a href="/login">
                <Button variant="secondary">Login Mock</Button>
              </a>
            </div>
            <p className="mt-4 text-sm text-[#6B7280]">
              🚀 Novo: Integração completa com backend API disponível!
            </p>
          </div>
          <div className="rounded-md border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="h-48 w-full rounded bg-[#D22630]/10" />
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-6 text-2xl font-bold text-[#1F2937]">Funcionalidades</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { t: "Integração WhatsApp (N8N)", d: "Confirmações, atualizações e campanhas." },
              { t: "Checkout com Asaas", d: "Cartão, Pix, boleto com retorno automático." },
              { t: "Vitrine responsiva", d: "Experiência mobile-first com carrinho rápido." },
            ].map((it) => (
              <div key={it.t} className="rounded-md border border-[#E5E7EB] bg-white p-4">
                <div className="mb-2 inline-flex rounded bg-[#FFC107] px-2 py-1 text-sm text-[#1F2937]">
                  {it.t}
                </div>
                <p className="text-[#4B5563]">{it.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-6 text-2xl font-bold text-[#1F2937]">Planos</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((p) => (
              <div key={p} className="rounded-md border border-[#E5E7EB] bg-white p-6">
                <div className="mb-2 font-semibold text-[#1F2937]">Plano {p}</div>
                <div className="mb-4 text-[#4B5563]">Descrição breve do plano {p}.</div>
                <a href="/signup">
                  <Button variant="primary" className="w-full">Assinar</Button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
