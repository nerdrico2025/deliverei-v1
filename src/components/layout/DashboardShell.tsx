import React from "react";
import { ImpersonationBanner } from "../system/ImpersonationBanner";
import { Topbar } from "./Topbar";

export const DashboardShell: React.FC<{
  sidebar: React.ReactNode;
  children: React.ReactNode;
}> = ({ sidebar, children }) => (
  <div className="flex min-h-screen bg-[#F9FAFB]">
    <aside className="hidden w-64 border-r border-[#E5E7EB] bg-white md:block">{sidebar}</aside>
    <div className="flex-1">
      <Topbar />
      <ImpersonationBanner />
      <main className="mx-auto max-w-7xl p-4">{children}</main>
    </div>
  </div>
);
