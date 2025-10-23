
import { IsString, IsNotEmpty, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateAvaliacaoDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  nota: number;

  @IsString()
  @IsOptional()
  comentario?: string;

  @IsString()
  @IsNotEmpty()
  produtoId: string;

  @IsString()
  @IsOptional()
  pedidoId?: string;
}
