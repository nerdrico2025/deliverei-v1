
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class ValidarCupomDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsNumber()
  @Min(0)
  valorCompra: number;
}
