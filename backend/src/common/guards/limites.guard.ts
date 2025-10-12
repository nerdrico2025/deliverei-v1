
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { PLANOS } from '../../modules/assinaturas/assinaturas.service';

export const LIMITE_KEY = 'limite';

@Injectable()
export class LimitesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tipoLimite = this.reflector.get<string>(
      LIMITE_KEY,
      context.getHandler(),
    );

    if (!tipoLimite) {
      return true;
    }

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

    const plano = PLANOS[assinatura.plano];

    if (tipoLimite === 'pedidos') {
      if (plano.pedidosMes === -1) {
        return true; // Ilimitado
      }

      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      const pedidosNoMes = await this.prisma.pedido.count({
        where: {
          empresaId,
          createdAt: {
            gte: inicioMes,
          },
        },
      });

      if (pedidosNoMes >= plano.pedidosMes) {
        throw new ForbiddenException(
          `Limite de ${plano.pedidosMes} pedidos por mês atingido`,
        );
      }
    }

    if (tipoLimite === 'produtos') {
      if (plano.produtos === -1) {
        return true; // Ilimitado
      }

      const produtosAtivos = await this.prisma.produto.count({
        where: {
          empresaId,
          ativo: true,
        },
      });

      if (produtosAtivos >= plano.produtos) {
        throw new ForbiddenException(
          `Limite de ${plano.produtos} produtos atingido`,
        );
      }
    }

    return true;
  }
}
