
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AtualizarItemCarrinhoDto {
  @ApiProperty({
    description: 'Nova quantidade do produto',
    example: 3,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantidade?: number;

  @ApiProperty({
    description: 'Novas observações sobre o item',
    example: 'Sem cebola e sem tomate',
    required: false,
  })
  @IsOptional()
  @IsString()
  observacoes?: string;
}
