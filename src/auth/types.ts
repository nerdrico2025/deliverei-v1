export type UserRole = "empresa" | "superadmin" | "suporte" | "cliente";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  empresaId?: string | null;
  avatarUrl?: string;
  lastLogin?: string;
};
