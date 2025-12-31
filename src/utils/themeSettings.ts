export type StorefrontThemeSettings = {
  backgroundImage?: string; // Data URL or absolute URL
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  updatedAt: number;
};

const THEME_KEY_PREFIX = "deliverei_theme_settings:";
const CHANNEL_NAME = "deliverei_theme_settings";

export const getSettingsKey = (slug?: string) => {
  const s = (slug || getSlugForSettings() || "default").trim();
  return `${THEME_KEY_PREFIX}${s}`;
};

export function getSlugForSettings(): string {
  try {
    return (
      localStorage.getItem("deliverei_store_slug") ||
      localStorage.getItem("deliverei_tenant_slug") ||
      "minha-loja"
    );
  } catch {
    return "minha-loja";
  }
}

export function getThemeSettings(slug?: string): StorefrontThemeSettings | null {
  try {
    const raw = localStorage.getItem(getSettingsKey(slug));
    return raw ? (JSON.parse(raw) as StorefrontThemeSettings) : null;
  } catch {
    return null;
  }
}

export function saveThemeSettings(slug: string, settings: StorefrontThemeSettings) {
  try {
    const key = getSettingsKey(slug);
    localStorage.setItem(key, JSON.stringify({ ...settings, updatedAt: Date.now() }));
  } catch {}
  // Broadcast intra-window (SPA route) and cross-tab/window
  try {
    window.dispatchEvent(
      new CustomEvent("deliverei_theme_settings_updated", {
        detail: { slug, settings },
      })
    );
  } catch {}
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ slug, settings });
    // Close immediately to avoid leaks
    channel.close();
  } catch {}
}

// Color validation: HEX (#RGB, #RRGGBB) or rgb/rgba(…)
const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const RGB_RE = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|0?\.\d+|1))?\s*\)$/;

export function isColorValid(value: string): boolean {
  if (!value) return false;
  const v = value.trim();
  if (HEX_RE.test(v)) return true;
  if (RGB_RE.test(v)) {
    const m = v.match(RGB_RE);
    if (!m) return false;
    const r = Number(m[1]), g = Number(m[2]), b = Number(m[3]);
    return r <= 255 && g <= 255 && b <= 255;
  }
  return false;
}

export function normalizeColor(value: string): string {
  const v = value.trim();
  if (HEX_RE.test(v)) return v.toLowerCase();
  if (RGB_RE.test(v)) return v.replace(/\s+/g, "");
  return v;
}

// Image helpers
export function isImageTypeAllowed(file: File): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    type === "image/jpeg" ||
    type === "image/jpg" ||
    type === "image/png" ||
    type === "image/svg+xml" ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".svg")
  );
}

export function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function preloadImage(url?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!url) return reject(new Error("no-url"));
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("load-error"));
    img.src = url;
  });
}