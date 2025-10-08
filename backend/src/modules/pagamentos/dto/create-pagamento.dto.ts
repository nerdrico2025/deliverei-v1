
import { IsString, IsNumber, IsOptional, IsIn, IsDateString } from 'class-validator';

export class CreatePagamentoDto {
  @IsOptional()
  @IsString()
  pedidoId?: string;

  @IsString()
  @IsIn(['PIX', 'CARTAO', 'BOLETO'])
  metodo: string;

  @IsNumber()
  valor: number;

  @IsDateString()
  dataVencimento: string;

  @IsString()
  descricao: string;

  @IsString()
  clienteNome: string;

  @IsString()
  clienteEmail: string;

  @IsString()
  clienteCpfCnpj: string;

  @IsString()
  clienteTelefone: string;
}
