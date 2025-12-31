import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  async listarPorEmpresa(empresaId: string) {
    const items = await this.prisma.categoria.findMany({
      where: { empresaId },
      orderBy: { nome: 'asc' },
      select: { nome: true },
    });
    return items.map((i) => i.nome);
  }

  async adicionar(empresaId: string, nome: string) {
    const sanitized = String(nome || '').trim();
    if (!sanitized) return { sucesso: false, mensagem: 'Nome inválido' };
    try {
      await this.prisma.categoria.create({
        data: { empresaId, nome: sanitized },
      });
      return { sucesso: true };
    } catch {
      // Se já existir, considerar sucesso idempotente
      return { sucesso: true };
    }
  }
}
