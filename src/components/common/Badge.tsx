import React from "react";

type Tone = "default" | "warning" | "success" | "error" | "muted";

export const Badge: React.FC<{ tone?: Tone; children: React.ReactNode }> = ({
  tone = "default",
  children,
}) => {
  const tones = {
    default: "bg-[#D22630] text-white",
    warning: "bg-[#FFC107] text-[#1F2937]",
    success: "bg-[#16A34A] text-white",
    error: "bg-[#DC2626] text-white",
    muted: "bg-[#E5E7EB] text-[#4B5563]",
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${tones}`}>
      {children}
    </span>
  );
};
