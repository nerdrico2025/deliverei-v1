
import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateNotificacaoDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  mensagem: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['PEDIDO', 'SISTEMA', 'PROMOCAO'])
  tipo: string;

  @IsString()
  @IsNotEmpty()
  usuarioId: string;

  @IsString()
  @IsOptional()
  pedidoId?: string;
}
