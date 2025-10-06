import React from "react";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-[#1F2937] placeholder-[#9CA3AF]
      focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none ${className}`}
    {...props}
  />
));

Input.displayName = "Input";
