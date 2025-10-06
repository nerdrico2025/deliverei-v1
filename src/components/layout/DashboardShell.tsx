import React from "react";
import { ImpersonationBanner } from "../system/ImpersonationBanner";
import { Topbar } from "./Topbar";

export const DashboardShell: React.FC<{
  sidebar: React.ReactNode;
  children: React.ReactNode;
}> = ({ sidebar, children }) => (
  <div className="flex min-h-screen bg-[#F3F4F6]">
    <aside className="hidden w-64 border-r border-[#E5E7EB] bg-white md:block">{sidebar}</aside>
    <div className="flex-1 flex flex-col">
      <Topbar />
      <ImpersonationBanner />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  </div>
);
