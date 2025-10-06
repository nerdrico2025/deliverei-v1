import React from "react";
import { Button } from "../common/Button";

export const PublicHeader: React.FC = () => (
  <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/90 backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded bg-[#D22630]" />
        <span className="font-bold text-[#D22630]">DELIVEREI</span>
      </div>
      <nav className="hidden gap-6 md:flex">
        <a className="text-[#4B5563] hover:text-[#1F2937]" href="#features">
          Funcionalidades
        </a>
        <a className="text-[#4B5563] hover:text-[#1F2937]" href="#pricing">
          Planos
        </a>
        <a className="text-[#4B5563] hover:text-[#1F2937]" href="#integrations">
          Integrações
        </a>
      </nav>
      <a href="/login">
        <Button variant="primary">Entrar</Button>
      </a>
    </div>
  </header>
);
