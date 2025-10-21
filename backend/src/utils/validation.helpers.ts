import { NotFoundException, ForbiddenException } from '@nestjs/common';

export function validateEntityExists<T>(entity: T | null, entityName: string): T {
  if (!entity) {
    throw new NotFoundException(`${entityName} não encontrado`);
  }
  return entity;
}

export function validateOwnershipOrAdmin(
  entityUserId: string,
  currentUserId: string,
  isAdmin: boolean = false
): void {
  if (!isAdmin && entityUserId !== currentUserId) {
    throw new ForbiddenException('Acesso negado: você não tem permissão para acessar este recurso');
  }
}