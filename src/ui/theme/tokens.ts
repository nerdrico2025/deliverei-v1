export const Colors = {
  primary: "#D22630",
  primaryHover: "#B31E27",
  secondary: "#FFC107",
  secondaryHover: "#E0A806",
  background: "#FFFFFF",
  surface: "#FFFFFF",
  text: "#1F2937",
  textSecondary: "#4B5563",
  border: "#E5E7EB",
  success: "#16A34A",
  warning: "#F59E0B",
  error: "#DC2626",
  info: "#0EA5E9",
} as const;

export const Radii = {
  sm: 6,
  md: 8,
  lg: 12,
  pill: 999,
} as const;

export const Shadows = {
  sm: "0 1px 2px rgba(0,0,0,.06)",
  md: "0 4px 12px rgba(0,0,0,.12)",
} as const;

export const Spacing = [0, 4, 8, 12, 16, 24, 32] as const;

export const Typography = {
  fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  h1: { size: 32, weight: 700, lineHeight: 1.2 },
  h2: { size: 24, weight: 700, lineHeight: 1.3 },
  h3: { size: 20, weight: 600, lineHeight: 1.4 },
  body: { size: 16, weight: 400, lineHeight: 1.6 },
  small: { size: 14, weight: 400, lineHeight: 1.5 },
} as const;

export const Theme = { Colors, Radii, Shadows, Spacing, Typography };
