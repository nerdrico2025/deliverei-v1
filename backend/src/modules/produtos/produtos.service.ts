import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateProdutoDto, UpdateProdutoDto } from './dto';

@Injectable()
export class ProdutosService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(createProdutoDto: CreateProdutoDto, empresaId: string) {
    return this.prisma.produto.create({
      data: {
        ...createProdutoDto,
        empresaId,
      },
    });
  }

  async findAll(
    empresaId: string,
    page: number = 1,
    limit: number = 20,
    categoria?: string,
    search?: string,
    ativo?: boolean,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      empresaId,
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

    if (ativo !== undefined) {
      where.ativo = ativo;
    }

    const [produtos, total] = await Promise.all([
      this.prisma.produto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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

  async findOne(id: string, empresaId: string) {
    const produto = await this.prisma.produto.findFirst({
      where: {
        id,
        empresaId,
      },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    return produto;
  }

  async update(
    id: string,
    updateProdutoDto: UpdateProdutoDto,
    empresaId: string,
  ) {
    // Verificar se o produto existe e pertence à empresa
    await this.findOne(id, empresaId);

    return this.prisma.produto.update({
      where: { id },
      data: updateProdutoDto,
    });
  }

  async remove(id: string, empresaId: string) {
    // Verificar se o produto existe e pertence à empresa
    await this.findOne(id, empresaId);

    // Soft delete - apenas marca como inativo
    return this.prisma.produto.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async hardRemove(id: string, empresaId: string) {
    // Verificar se o produto existe e pertence à empresa
    await this.findOne(id, empresaId);

    // Hard delete - remove do banco
    return this.prisma.produto.delete({
      where: { id },
    });
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
