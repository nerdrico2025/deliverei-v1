
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';

@Injectable()
export class AvaliacoesService {
  constructor(private prisma: PrismaService) {}

  async create(createAvaliacaoDto: CreateAvaliacaoDto, usuarioId: string, empresaId: string) {
    // Verificar se o produto existe e pertence à empresa
    const produto = await this.prisma.produto.findFirst({
      where: { id: createAvaliacaoDto.produtoId, empresaId },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    return this.prisma.avaliacao.create({
      data: {
        ...createAvaliacaoDto,
        usuarioId,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        produto: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
  }

  async findByProduto(produtoId: string, empresaId: string) {
    // Verificar se o produto pertence à empresa
    const produto = await this.prisma.produto.findFirst({
      where: { id: produtoId, empresaId },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    const avaliacoes = await this.prisma.avaliacao.findMany({
      where: { produtoId },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = avaliacoes.length;
    const soma = avaliacoes.reduce((acc, av) => acc + av.nota, 0);
    const media = total > 0 ? soma / total : 0;

    return {
      avaliacoes,
      estatisticas: {
        total,
        media: Number(media.toFixed(1)),
      },
    };
  }

  async findByUsuario(usuarioId: string, empresaId: string) {
    return this.prisma.avaliacao.findMany({
      where: { 
        usuarioId,
        produto: { empresaId }
      },
      include: {
        produto: {
          select: {
            id: true,
            nome: true,
            imagem: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string, usuarioId: string, empresaId: string) {
    const avaliacao = await this.prisma.avaliacao.findUnique({
      where: { id },
      include: { produto: true },
    });

    if (!avaliacao) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    if (avaliacao.usuarioId !== usuarioId) {
      throw new ForbiddenException('Você não pode deletar esta avaliação');
    }

    // Validar se o produto pertence à empresa
    if (avaliacao.produto.empresaId !== empresaId) {
      throw new ForbiddenException('Avaliação não encontrada');
    }

    return this.prisma.avaliacao.delete({
      where: { id },
    });
  }
}
