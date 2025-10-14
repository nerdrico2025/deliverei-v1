import React from "react";

/**
 * Tipos comuns para componentes base
 */

export type Variant = "primary" | "secondary" | "ghost" | "danger";
export type Size = "sm" | "md" | "lg";
export type Tone = "default" | "warning" | "success" | "error" | "muted";

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, BaseComponentProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export interface CardProps extends BaseComponentProps {}

export interface BadgeProps extends BaseComponentProps {
  tone?: Tone;
}

export interface LoadingProps {
  size?: Size;
  variant?: "spinner" | "dots" | "pulse";
  className?: string;
  fullScreen?: boolean;
  message?: string;
}

export interface ContainerProps extends BaseComponentProps {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: boolean;
}
