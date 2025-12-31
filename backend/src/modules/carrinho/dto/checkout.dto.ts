
import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class EnderecoEntregaDto {
  @ApiProperty({ example: 'Rua das Flores' })
  @IsString()
  rua: string;

  @ApiProperty({ example: '123' })
  @IsString()
  numero: string;

  @ApiProperty({ required: false, example: 'Apto 45' })
  @IsOptional()
  @IsString()
  complemento?: string;

  @ApiProperty({ example: 'Centro' })
  @IsString()
  bairro: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  cidade: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  estado: string;

  @ApiProperty({ example: '01000-000' })
  @IsString()
  cep: string;
}

export class CheckoutDto {
  @ApiProperty({
    description: 'Endereço de entrega',
    type: EnderecoEntregaDto,
  })
  @ValidateNested()
  @Type(() => EnderecoEntregaDto)
  enderecoEntrega: EnderecoEntregaDto;

  @ApiProperty({
    description: 'Forma de pagamento',
    example: 'Cartão de Crédito',
  })
  @IsString()
  formaPagamento: string;

  @ApiProperty({
    description: 'Cupom de desconto',
    example: 'PRIMEIRACOMPRA',
    required: false,
  })
  @IsOptional()
  @IsString()
  cupomDesconto?: string;

  @ApiProperty({
    description: 'Observações gerais do pedido',
    example: 'Entregar após as 18h',
    required: false,
  })
  @IsOptional()
  @IsString()
  observacoes?: string;
}
