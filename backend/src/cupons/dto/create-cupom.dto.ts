
import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, IsBoolean, IsIn, Min } from 'class-validator';

export class CreateCupomDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['PERCENTUAL', 'VALOR_FIXO'])
  tipo: string;

  @IsNumber()
  @Min(0)
  valor: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  valorMinimo?: number;

  @IsDateString()
  dataInicio: string;

  @IsDateString()
  dataFim: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  usoMaximo?: number;
}
