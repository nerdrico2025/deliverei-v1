import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

/**
 * Helper para validar se um registro existe
 * @param record Registro retornado do banco
 * @param entityName Nome da entidade (ex: 'Produto', 'Pedido')
 * @throws NotFoundException se o registro não existir
 */
export function validateEntityExists<T>(
  record: T | null | undefined,
  entityName: string,
): asserts record is T {
  if (!record) {
    throw new NotFoundException(`${entityName} não encontrado`);
  }
}

/**
 * Helper para validar permissão de acesso ao recurso
 * @param condition Condição que deve ser verdadeira para ter acesso
 * @param message Mensagem de erro customizada (opcional)
 * @throws ForbiddenException se a condição for falsa
 */
export function validatePermission(
  condition: boolean,
  message: string = 'Você não tem permissão para acessar este recurso',
): asserts condition {
  if (!condition) {
    throw new ForbiddenException(message);
  }
}

/**
 * Helper para validar se o usuário é dono do recurso ou é admin
 * @param resourceOwnerId ID do dono do recurso
 * @param userId ID do usuário atual
 * @param isAdmin Se o usuário é admin
 * @param entityName Nome da entidade para mensagem de erro
 * @throws ForbiddenException se o usuário não tiver permissão
 */
export function validateOwnershipOrAdmin(
  resourceOwnerId: string,
  userId: string,
  isAdmin: boolean,
  entityName: string,
): void {
  if (!isAdmin && resourceOwnerId !== userId) {
    throw new ForbiddenException(
      `Você não tem permissão para acessar este ${entityName}`,
    );
  }
}

/**
 * Helper para validar se um valor está presente
 * @param value Valor a ser validado
 * @param fieldName Nome do campo para mensagem de erro
 * @throws BadRequestException se o valor for undefined/null/empty
 */
export function validateRequired(
  value: any,
  fieldName: string,
): asserts value {
  if (value === undefined || value === null || value === '') {
    throw new BadRequestException(`${fieldName} é obrigatório`);
  }
}

/**
 * Helper para validar se uma data está dentro de um período
 * @param date Data a ser validada
 * @param startDate Data de início
 * @param endDate Data de fim
 * @param fieldName Nome do campo para mensagem de erro
 * @throws BadRequestException se a data estiver fora do período
 */
export function validateDateRange(
  date: Date,
  startDate: Date,
  endDate: Date,
  fieldName: string = 'Data',
): void {
  if (date < startDate || date > endDate) {
    throw new BadRequestException(
      `${fieldName} deve estar entre ${startDate.toISOString()} e ${endDate.toISOString()}`,
    );
  }
}

/**
 * Helper para validar se um valor numérico está dentro de um range
 * @param value Valor a ser validado
 * @param min Valor mínimo
 * @param max Valor máximo
 * @param fieldName Nome do campo para mensagem de erro
 * @throws BadRequestException se o valor estiver fora do range
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string,
): void {
  if (value < min || value > max) {
    throw new BadRequestException(
      `${fieldName} deve estar entre ${min} e ${max}`,
    );
  }
}

/**
 * Helper para validar se um registro pertence à empresa (multi-tenant)
 * @param record Registro com campo empresaId
 * @param empresaId ID da empresa do usuário atual
 * @param entityName Nome da entidade para mensagem de erro
 * @throws ForbiddenException se o registro não pertencer à empresa
 */
export function validateTenantAccess(
  record: { empresaId: string } | null | undefined,
  empresaId: string,
  entityName: string,
): void {
  if (!record) {
    throw new NotFoundException(`${entityName} não encontrado`);
  }
  
  if (record.empresaId !== empresaId) {
    throw new ForbiddenException(
      `Você não tem permissão para acessar este ${entityName}`,
    );
  }
}

/**
 * Helper para validar se um status é válido
 * @param status Status a ser validado
 * @param validStatuses Lista de status válidos
 * @param fieldName Nome do campo para mensagem de erro
 * @throws BadRequestException se o status não for válido
 */
export function validateStatus<T extends string>(
  status: T,
  validStatuses: readonly T[],
  fieldName: string = 'Status',
): void {
  if (!validStatuses.includes(status)) {
    throw new BadRequestException(
      `${fieldName} inválido. Valores aceitos: ${validStatuses.join(', ')}`,
    );
  }
}
