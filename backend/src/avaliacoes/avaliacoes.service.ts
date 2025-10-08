
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';

@Injectable()
export class AvaliacoesService {
  constructor(private prisma: PrismaService) {}

  async create(createAvaliacaoDto: CreateAvaliacaoDto, usuarioId: string) {
    // Verificar se o produto existe
    const produto = await this.prisma.produto.findUnique({
      where: { id: createAvaliacaoDto.produtoId },
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

  async findByProduto(produtoId: string) {
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

  async findByUsuario(usuarioId: string) {
    return this.prisma.avaliacao.findMany({
      where: { usuarioId },
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

  async remove(id: string, usuarioId: string) {
    const avaliacao = await this.prisma.avaliacao.findUnique({
      where: { id },
    });

    if (!avaliacao) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    if (avaliacao.usuarioId !== usuarioId) {
      throw new ForbiddenException('Você não pode deletar esta avaliação');
    }

    return this.prisma.avaliacao.delete({
      where: { id },
    });
  }
}
