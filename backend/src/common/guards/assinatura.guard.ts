
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AssinaturaGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Temporariamente desabilitado - módulo de assinaturas não implementado
    return true;
    
    /*
    const request = context.switchToHttp().getRequest();
    const empresaId = request.user?.empresaId;

    if (!empresaId) {
      throw new ForbiddenException('Empresa não identificada');
    }

    const assinatura = await this.prisma.assinatura.findUnique({
      where: { empresaId },
    });

    if (!assinatura) {
      throw new ForbiddenException('Empresa não possui assinatura');
    }

    if (assinatura.status !== 'ATIVA' && assinatura.status !== 'TRIAL') {
      throw new ForbiddenException('Assinatura inativa ou suspensa');
    }

    // Adicionar informações da assinatura ao request
    request.assinatura = assinatura;

    return true;
    */
  }
}
