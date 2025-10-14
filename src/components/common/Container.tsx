import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = "",
  maxWidth = "2xl",
  padding = true,
}) => {
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  }[maxWidth];

  const paddingClass = padding ? "px-4 sm:px-6 lg:px-8" : "";

  return (
    <div className={`mx-auto ${maxWidthClasses} ${paddingClass} ${className}`}>
      {children}
    </div>
  );
};
