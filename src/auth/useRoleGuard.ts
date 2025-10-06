import { useAuth } from "./AuthContext";
import type { UserRole } from "./types";

export function useRoleGuard(required?: UserRole | UserRole[]) {
  const { isAuth, user } = useAuth();
  const ok =
    !required ||
    (Array.isArray(required)
      ? required.includes(user?.role as UserRole)
      : user?.role === required);
  return { isAuth, role: user?.role, allowed: !!user && ok };
}
