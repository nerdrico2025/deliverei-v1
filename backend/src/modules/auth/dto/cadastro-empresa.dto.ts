import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CadastroEmpresaDto {
  // Dados da empresa
  @IsString({ message: 'Nome da empresa deve ser uma string' })
  nomeEmpresa: string;

  @IsString({ message: 'Slug deve ser uma string' })
  slug: string;

  @IsOptional()
  @IsString({ message: 'Telefone da empresa deve ser uma string' })
  telefoneEmpresa?: string;

  @IsOptional()
  @IsString({ message: 'Endereço deve ser uma string' })
  endereco?: string;

  @IsOptional()
  @IsString({ message: 'Cidade deve ser uma string' })
  cidade?: string;

  @IsOptional()
  @IsString({ message: 'Estado deve ser uma string' })
  estado?: string;

  @IsOptional()
  @IsString({ message: 'CEP deve ser uma string' })
  cep?: string;

  // Dados do usuário admin
  @IsString({ message: 'Nome do admin deve ser uma string' })
  nomeAdmin: string;

  @IsEmail({}, { message: 'Email do admin deve ter um formato válido' })
  emailAdmin: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  senhaAdmin: string;

  @IsOptional()
  @IsString({ message: 'Telefone do admin deve ser uma string' })
  telefoneAdmin?: string;
}