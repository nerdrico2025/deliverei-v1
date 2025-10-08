
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class UpdateStatusPedidoDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['PENDENTE', 'CONFIRMADO', 'EM_PREPARO', 'SAIU_ENTREGA', 'ENTREGUE', 'CANCELADO'])
  status: string;
}
