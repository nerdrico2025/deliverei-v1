
import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificacaoDto } from './create-notificacao.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificacaoDto extends PartialType(CreateNotificacaoDto) {
  @IsBoolean({ message: 'Lida deve ser um booleano' })
  @IsOptional()
  lida?: boolean;
}
