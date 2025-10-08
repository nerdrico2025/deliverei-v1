
import { IsString, IsEmail, IsIn } from 'class-validator';

export class CreateAssinaturaDto {
  @IsString()
  @IsIn(['BASICO', 'PROFISSIONAL', 'ENTERPRISE'])
  plano: string;

  @IsEmail()
  email: string;
}
