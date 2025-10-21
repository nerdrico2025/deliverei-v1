import { SetMetadata } from '@nestjs/common';

// Enum TipoUsuario como constantes para compatibilidade com SQLite
const TipoUsuario = {
  CLIENTE: 'CLIENTE',
  ADMIN_EMPRESA: 'ADMIN_EMPRESA',
  SUPER_ADMIN: 'SUPER_ADMIN'
} as const;

type TipoUsuarioType = typeof TipoUsuario[keyof typeof TipoUsuario];

export const ROLES_KEY = 'roles';
export const Roles = (...roles: TipoUsuarioType[]) => SetMetadata(ROLES_KEY, roles);
