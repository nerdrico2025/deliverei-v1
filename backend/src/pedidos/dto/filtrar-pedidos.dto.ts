import { IsOptional, IsEnum, IsString, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

// Enum StatusPedido como constantes para compatibilidade com SQLite
export const StatusPedido = {
  PENDENTE: 'PENDENTE',
  CONFIRMADO: 'CONFIRMADO',
  EM_PREPARO: 'EM_PREPARO',
  SAIU_ENTREGA: 'SAIU_ENTREGA',
  ENTREGUE: 'ENTREGUE',
  CANCELADO: 'CANCELADO'
} as const;

export type StatusPedidoType = typeof StatusPedido[keyof typeof StatusPedido];

export class FiltrarPedidosDto {
  @IsOptional()
  @IsEnum(StatusPedido)
  status?: StatusPedidoType;

  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @IsOptional()
  @IsString()
  usuarioId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}