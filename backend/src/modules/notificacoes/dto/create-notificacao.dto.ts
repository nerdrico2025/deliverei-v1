
import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateNotificacaoDto {
  @IsString({ message: 'Título deve ser uma string' })
  @IsNotEmpty({ message: 'Título é obrigatório' })
  titulo: string;

  @IsString({ message: 'Mensagem deve ser uma string' })
  @IsNotEmpty({ message: 'Mensagem é obrigatória' })
  mensagem: string;

  @IsString({ message: 'Tipo deve ser uma string' })
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  @IsIn(['PEDIDO', 'SISTEMA', 'PROMOCAO'], {
    message: 'Tipo deve ser PEDIDO, SISTEMA ou PROMOCAO',
  })
  tipo: string;

  @IsString({ message: 'UsuarioId deve ser uma string' })
  @IsNotEmpty({ message: 'UsuarioId é obrigatório' })
  usuarioId: string;

  @IsString({ message: 'EmpresaId deve ser uma string' })
  @IsOptional()
  empresaId?: string;

  @IsString({ message: 'PedidoId deve ser uma string' })
  @IsOptional()
  pedidoId?: string;
}
