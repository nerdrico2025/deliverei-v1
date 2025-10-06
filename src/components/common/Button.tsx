import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
  }
> = ({ variant = "primary", size = "md", loading, children, className = "", ...props }) => {
  const base = "inline-flex items-center justify-center rounded-md font-semibold transition focus:outline-none focus:ring-2";
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-base",
  }[size];
  const variants = {
    primary: "bg-[#D22630] text-white hover:bg-[#B31E27] focus:ring-[#D22630]/30",
    secondary: "bg-[#FFC107] text-[#1F2937] hover:bg-[#E0A806] focus:ring-[#FFC107]/30",
    ghost: "bg-transparent text-[#D22630] hover:bg-[#D22630]/10 focus:ring-[#D22630]/20",
    danger: "bg-[#DC2626] text-white hover:bg-[#B91C1C] focus:ring-[#DC2626]/30",
  }[variant];

  return (
    <button
      className={`${base} ${sizes} ${variants} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Carregando..." : children}
    </button>
  );
};
