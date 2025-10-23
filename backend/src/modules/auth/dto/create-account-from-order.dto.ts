import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateAccountFromOrderDto {
  @IsString({ message: 'Nome deve ser uma string' })
  nome: string;

  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  email: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  senha: string;

  @IsString({ message: 'ID do pedido deve ser uma string' })
  pedidoId: string;

  @IsOptional()
  @IsString({ message: 'Telefone deve ser uma string' })
  telefone?: string;
}