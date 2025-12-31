import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StorefrontThemeSettings } from '../theme/theme.service';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly defaultTheme: StorefrontThemeSettings = {
    primaryColor: '#111827',
    secondaryColor: '#F9FAFB',
    accentColor: '#3B82F6',
    updatedAt: Date.now(),
  };

  async getLojaBySlug(slug: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { slug },
    });

    if (!empresa) {
      throw new NotFoundException('Loja não encontrada');
    }

    if (!empresa.ativo) {
      throw new NotFoundException('Loja inativa');
    }

    return {
      id: empresa.id,
      nome: empresa.nome,
      slug: empresa.slug,
      subdominio: empresa.subdominio,
    };
  }

  async getProdutosByLoja(
    slug: string,
    page: number = 1,
    limit: number = 20,
    categoria?: string,
    search?: string,
  ) {
    const empresa = await this.getLojaBySlug(slug);

    const skip = (page - 1) * limit;

    const where: any = {
      empresaId: empresa.id,
      ativo: true,
    };

    if (categoria) {
      where.categoria = categoria;
    }

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [produtos, total] = await Promise.all([
      this.prisma.produto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.produto.count({ where }),
    ]);

    return {
      data: produtos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProdutoById(slug: string, produtoId: string) {
    const empresa = await this.getLojaBySlug(slug);

    const produto = await this.prisma.produto.findFirst({
      where: {
        id: produtoId,
        empresaId: empresa.id,
        ativo: true,
      },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    return produto;
  }

  async getCategorias(slug: string) {
    const empresa = await this.getLojaBySlug(slug);

    const categoriasProdutos = await this.prisma.produto.findMany({
      where: {
        empresaId: empresa.id,
        ativo: true,
        categoria: { not: null },
      },
      select: {
        categoria: true,
      },
      distinct: ['categoria'],
    });

    const categoriasSalvas = await this.prisma.categoria.findMany({
      where: { empresaId: empresa.id },
      select: { nome: true },
    });

    const set = new Set<string>();
    categoriasProdutos.forEach((c) => c.categoria && set.add(c.categoria));
    categoriasSalvas.forEach((c) => c.nome && set.add(c.nome));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  async getTheme(slug: string): Promise<{ settings: StorefrontThemeSettings | null }> {
    try {
      const empresa = await this.prisma.empresa.findUnique({
        where: { slug },
      });
      if (!empresa) {
        throw new NotFoundException('Loja não encontrada');
      }
      if (!empresa.ativo) {
        throw new NotFoundException('Loja inativa');
      }
      const settings = (((empresa as any)?.vitrineTheme ?? (empresa as any)?.vitrine_theme) as any) || null;
      return { settings };
    } catch {
      return { settings: this.defaultTheme };
    }
  }
}
