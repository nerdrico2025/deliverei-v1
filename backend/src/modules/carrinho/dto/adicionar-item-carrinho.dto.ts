
import { IsString, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdicionarItemCarrinhoDto {
  @ApiProperty({
    description: 'ID do produto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  produtoId: string;

  @ApiProperty({
    description: 'Quantidade do produto',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantidade: number;

  @ApiProperty({
    description: 'Observações sobre o item',
    example: 'Sem cebola',
    required: false,
  })
  @IsOptional()
  @IsString()
  observacoes?: string;
}
