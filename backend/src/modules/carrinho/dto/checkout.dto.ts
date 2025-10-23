
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckoutDto {
  @ApiProperty({
    description: 'Endereço de entrega',
    example: 'Rua das Flores, 123 - Centro - São Paulo/SP',
  })
  @IsString()
  enderecoEntrega: string;

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
