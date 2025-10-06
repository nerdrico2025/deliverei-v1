import React from "react";

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`rounded-md border border-[#E5E7EB] bg-white shadow-sm ${className}`}>
    {children}
  </div>
);
