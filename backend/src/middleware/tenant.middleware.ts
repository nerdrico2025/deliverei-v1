import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async use(req: Request, res: Response, next: NextFunction) {
    // Extrair host do request
    const host = req.get('host') || req.hostname;
    
    // Extrair subdomínio
    // Exemplo: pizza-express.deliverei.com.br -> pizza-express
    // Ou em desenvolvimento: localhost:3000 -> null
    const subdomain = this.extractSubdomain(host);

    // Se não há subdomínio (acesso direto ao domínio base), pular
    if (!subdomain) {
      return next();
    }

    // Buscar empresa pelo subdomínio
    const empresa = await this.prisma.empresa.findUnique({
      where: { subdominio: subdomain },
    });

    if (!empresa) {
      throw new NotFoundException(`Loja "${subdomain}" não encontrada`);
    }

    if (!empresa.ativo) {
      throw new NotFoundException(`Loja "${subdomain}" está inativa`);
    }

    // Injetar empresa no request
    req['empresa'] = empresa;
    req['empresaId'] = empresa.id;

    next();
  }

  private extractSubdomain(host: string): string | null {
    // Remover porta se existir
    const hostWithoutPort = host.split(':')[0];

    // Se for localhost ou IP, retornar null
    if (hostWithoutPort === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostWithoutPort)) {
      return null;
    }

    // Dividir o host por pontos
    const parts = hostWithoutPort.split('.');

    // Se tiver menos de 3 partes, não é um subdomínio válido
    // Exemplo: deliverei.com.br tem 3 partes, pizza-express.deliverei.com.br tem 4
    if (parts.length < 3) {
      return null;
    }

    // Retornar a primeira parte como subdomínio
    return parts[0];
  }
}
