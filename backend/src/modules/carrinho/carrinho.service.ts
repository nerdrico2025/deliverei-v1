
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  AdicionarItemCarrinhoDto,
  AtualizarItemCarrinhoDto,
  CheckoutDto,
} from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CarrinhoService {
  constructor(private prisma: PrismaService) {}

  async obterCarrinho(usuarioId: string, empresaId: string) {
    let carrinho = await this.prisma.carrinho.findFirst({
      where: {
        usuarioId,
        empresaId,
      },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });

    if (!carrinho) {
      carrinho = await this.prisma.carrinho.create({
        data: {
          usuarioId,
          empresaId,
        },
        include: {
          itens: {
            include: {
              produto: true,
            },
          },
        },
      });
    }

    const subtotal = carrinho.itens.reduce((acc, item) => {
      return acc + Number(item.precoUnitario) * item.quantidade;
    }, 0);

    return {
      ...carrinho,
      subtotal,
      totalItens: carrinho.itens.reduce((acc, item) => acc + item.quantidade, 0),
    };
  }

  async adicionarItem(
    usuarioId: string,
    empresaId: string,
    dto: AdicionarItemCarrinhoDto,
  ) {
    // Verificar se o produto existe e pertence à empresa
    const produto = await this.prisma.produto.findFirst({
      where: {
        id: dto.produtoId,
        empresaId,
        ativo: true,
      },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado ou inativo');
    }

    // Verificar estoque
    if (produto.estoque < dto.quantidade) {
      throw new BadRequestException('Estoque insuficiente');
    }

    // Obter ou criar carrinho
    let carrinho = await this.prisma.carrinho.findFirst({
      where: {
        usuarioId,
        empresaId,
      },
    });

    if (!carrinho) {
      carrinho = await this.prisma.carrinho.create({
        data: {
          usuarioId,
          empresaId,
        },
      });
    }

    // Verificar se o item já existe no carrinho
    const itemExistente = await this.prisma.itemCarrinho.findFirst({
      where: {
        carrinhoId: carrinho.id,
        produtoId: dto.produtoId,
      },
    });

    if (itemExistente) {
      // Atualizar quantidade
      const novaQuantidade = itemExistente.quantidade + dto.quantidade;
      
      if (produto.estoque < novaQuantidade) {
        throw new BadRequestException('Estoque insuficiente');
      }

      return this.prisma.itemCarrinho.update({
        where: { id: itemExistente.id },
        data: {
          quantidade: novaQuantidade,
        },
        include: {
          produto: true,
        },
      });
    }

    // Criar novo item
    return this.prisma.itemCarrinho.create({
      data: {
        carrinhoId: carrinho.id,
        produtoId: dto.produtoId,
        quantidade: dto.quantidade,
        precoUnitario: produto.preco,
      },
      include: {
        produto: true,
      },
    });
  }

  async atualizarItem(
    usuarioId: string,
    empresaId: string,
    itemId: string,
    dto: AtualizarItemCarrinhoDto,
  ) {
    // Buscar item e verificar se pertence ao usuário
    const item = await this.prisma.itemCarrinho.findFirst({
      where: {
        id: itemId,
        carrinho: {
          usuarioId,
          empresaId,
        },
      },
      include: {
        produto: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Item não encontrado no carrinho');
    }

    // Verificar estoque se quantidade foi alterada
    if (dto.quantidade && dto.quantidade !== item.quantidade) {
      if (item.produto.estoque < dto.quantidade) {
        throw new BadRequestException('Estoque insuficiente');
      }
    }

    return this.prisma.itemCarrinho.update({
      where: { id: itemId },
      data: {
        quantidade: dto.quantidade,
      },
      include: {
        produto: true,
      },
    });
  }

  async removerItem(usuarioId: string, empresaId: string, itemId: string) {
    // Verificar se o item pertence ao usuário
    const item = await this.prisma.itemCarrinho.findFirst({
      where: {
        id: itemId,
        carrinho: {
          usuarioId,
          empresaId,
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Item não encontrado no carrinho');
    }

    await this.prisma.itemCarrinho.delete({
      where: { id: itemId },
    });

    return { message: 'Item removido com sucesso' };
  }

  async limparCarrinho(usuarioId: string, empresaId: string) {
    const carrinho = await this.prisma.carrinho.findFirst({
      where: {
        usuarioId,
        empresaId,
      },
    });

    if (!carrinho) {
      throw new NotFoundException('Carrinho não encontrado');
    }

    await this.prisma.itemCarrinho.deleteMany({
      where: {
        carrinhoId: carrinho.id,
      },
    });

    return { message: 'Carrinho limpo com sucesso' };
  }

  async checkout(usuarioId: string, empresaId: string, dto: CheckoutDto) {
    // Buscar carrinho com itens
    const carrinho = await this.prisma.carrinho.findFirst({
      where: {
        usuarioId,
        empresaId,
      },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });

    if (!carrinho || carrinho.itens.length === 0) {
      throw new BadRequestException('Carrinho vazio');
    }

    // Validar estoque de todos os itens
    for (const item of carrinho.itens) {
      if (item.produto.estoque < item.quantidade) {
        throw new BadRequestException(
          `Estoque insuficiente para o produto: ${item.produto.nome}`,
        );
      }
    }

    // Calcular totais
    const subtotal = carrinho.itens.reduce((acc, item) => {
      return acc + Number(item.precoUnitario) * item.quantidade;
    }, 0);

    const desconto = 0; // TODO: Implementar lógica de cupom de desconto
    const total = subtotal - desconto;

    // Gerar número do pedido
    const numeroPedido = `PED-${Date.now()}`;

    // Criar pedido e itens em uma transação
    const pedido = await this.prisma.$transaction(async (tx) => {
      // Criar pedido
      const novoPedido = await tx.pedido.create({
        data: {
          numero: numeroPedido,
          subtotal: subtotal,
          desconto: desconto,
          total: total,
          clienteId: usuarioId,
          empresaId,
          enderecoEntrega: dto.enderecoEntrega,
          formaPagamento: dto.formaPagamento,
          cupomDesconto: dto.cupomDesconto,
          observacoes: dto.observacoes,
        },
      });

      // Criar itens do pedido (otimização: createMany ao invés de loop)
      await tx.itemPedido.createMany({
        data: carrinho.itens.map((item) => ({
          pedidoId: novoPedido.id,
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          subtotal: Number(item.precoUnitario) * item.quantidade,
        })),
      });

      // Atualizar estoque de todos os produtos (otimização: updates em paralelo)
      await Promise.all(
        carrinho.itens.map((item) =>
          tx.produto.update({
            where: { id: item.produtoId },
            data: {
              estoque: {
                decrement: item.quantidade,
              },
            },
          }),
        ),
      );

      // Limpar carrinho
      await tx.itemCarrinho.deleteMany({
        where: {
          carrinhoId: carrinho.id,
        },
      });

      return novoPedido;
    });

    // Buscar pedido completo com itens
    return this.prisma.pedido.findUnique({
      where: { id: pedido.id },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });
  }

  async obterRecomendacoes(usuarioId: string, empresaId: string) {
    // Buscar carrinho
    const carrinho = await this.prisma.carrinho.findFirst({
      where: {
        usuarioId,
        empresaId,
      },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });

    if (!carrinho || carrinho.itens.length === 0) {
      // Se carrinho vazio, retornar produtos mais vendidos
      return this.prisma.produto.findMany({
        where: {
          empresaId,
          ativo: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });
    }

    // Obter categorias dos produtos no carrinho
    const categorias = carrinho.itens
      .map((item) => item.produto.categoria)
      .filter((cat) => cat !== null);

    // IDs dos produtos já no carrinho
    const produtosNoCarrinho = carrinho.itens.map((item) => item.produtoId);

    // Buscar produtos da mesma categoria que não estão no carrinho
    const recomendacoes = await this.prisma.produto.findMany({
      where: {
        empresaId,
        ativo: true,
        id: {
          notIn: produtosNoCarrinho,
        },
        ...(categorias.length > 0 && {
          categoria: {
            in: categorias,
          },
        }),
      },
      orderBy: [
        { preco: 'desc' }, // Produtos com maior preço primeiro (upsell)
        { createdAt: 'desc' },
      ],
      take: 5,
    });

    return recomendacoes;
  }
}
