import React from "react";

type Size = "sm" | "md" | "lg";
type Variant = "spinner" | "dots" | "pulse";

interface LoadingProps {
  size?: Size;
  variant?: Variant;
  className?: string;
  fullScreen?: boolean;
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = "md",
  variant = "spinner",
  className = "",
  fullScreen = false,
  message,
}) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }[size];

  const renderSpinner = () => (
    <div
      className={`animate-spin rounded-full border-b-2 border-[#D22630] ${sizeClasses} ${className}`}
      role="status"
      aria-label="Carregando"
    />
  );

  const renderDots = () => (
    <div className={`flex space-x-2 ${className}`}>
      <div className="h-3 w-3 animate-bounce rounded-full bg-[#D22630]" style={{ animationDelay: "0ms" }} />
      <div className="h-3 w-3 animate-bounce rounded-full bg-[#D22630]" style={{ animationDelay: "150ms" }} />
      <div className="h-3 w-3 animate-bounce rounded-full bg-[#D22630]" style={{ animationDelay: "300ms" }} />
    </div>
  );

  const renderPulse = () => (
    <div className={`animate-pulse rounded-md bg-[#E5E7EB] ${sizeClasses} ${className}`} />
  );

  const renderVariant = () => {
    switch (variant) {
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      {renderVariant()}
      {message && <p className="text-sm text-[#4B5563]">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return content;
};
