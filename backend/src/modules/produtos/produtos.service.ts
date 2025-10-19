import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProdutoDto, UpdateProdutoDto } from './dto';
import { paginatedResponse, calculatePagination } from '../../utils';

@Injectable()
export class ProdutosService {
  private readonly logger = new Logger(ProdutosService.name);
  private readonly useMockData = process.env.USE_MOCK_PRODUTOS === 'true';

  // Dados mock para testes e desenvolvimento
  private mockProdutos = [
    {
      id: 'mock-1',
      nome: 'Pizza Margherita',
      descricao: 'Pizza tradicional com molho de tomate, mussarela e manjericão',
      preco: 35.90,
      imagem: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
      ativo: true,
      estoque: 50,
      categoria: 'Pizza',
      empresaId: 'mock-empresa',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock-2',
      nome: 'Hamburger Artesanal',
      descricao: 'Hambúrguer 200g, queijo, alface, tomate e molho especial',
      preco: 28.50,
      imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      ativo: true,
      estoque: 30,
      categoria: 'Lanches',
      empresaId: 'mock-empresa',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock-3',
      nome: 'Refrigerante Lata',
      descricao: 'Coca-Cola, Guaraná ou Fanta 350ml',
      preco: 5.00,
      imagem: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
      ativo: true,
      estoque: 100,
      categoria: 'Bebidas',
      empresaId: 'mock-empresa',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock-4',
      nome: 'Sushi Combinado',
      descricao: '20 peças variadas de sushi e sashimi',
      preco: 65.00,
      imagem: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
      ativo: true,
      estoque: 15,
      categoria: 'Japonês',
      empresaId: 'mock-empresa',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock-5',
      nome: 'Açaí Bowl',
      descricao: 'Açaí 500ml com granola, banana e mel',
      preco: 22.00,
      imagem: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400',
      ativo: true,
      estoque: 25,
      categoria: 'Sobremesas',
      empresaId: 'mock-empresa',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  constructor(private readonly prisma: PrismaService) {
    if (this.useMockData) {
      this.logger.warn('⚠️  Usando dados MOCK para produtos (USE_MOCK_PRODUTOS=true)');
    }
  }

  async create(createProdutoDto: CreateProdutoDto, empresaId: string) {
    if (this.useMockData) {
      const newProduto = {
        id: `mock-${Date.now()}`,
        ...createProdutoDto,
        ativo: createProdutoDto.ativo ?? true,
        estoque: createProdutoDto.estoque ?? 0,
        empresaId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.mockProdutos.push(newProduto);
      return newProduto;
    }

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
    if (this.useMockData) {
      let filtered = this.mockProdutos.filter(p => p.empresaId === empresaId);

      if (categoria) {
        filtered = filtered.filter(p => p.categoria === categoria);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          p =>
            p.nome.toLowerCase().includes(searchLower) ||
            p.descricao?.toLowerCase().includes(searchLower),
        );
      }

      if (ativo !== undefined) {
        filtered = filtered.filter(p => p.ativo === ativo);
      }

      const total = filtered.length;
      const skip = (page - 1) * limit;
      const produtos = filtered.slice(skip, skip + limit);

      return paginatedResponse(produtos, calculatePagination(total, page, limit));
    }

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

    return paginatedResponse(produtos, calculatePagination(total, page, limit));
  }

  async findOne(id: string, empresaId: string) {
    if (this.useMockData) {
      const produto = this.mockProdutos.find(
        p => p.id === id && p.empresaId === empresaId,
      );

      if (!produto) {
        throw new NotFoundException('Produto não encontrado');
      }

      return produto;
    }

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
    if (this.useMockData) {
      const index = this.mockProdutos.findIndex(
        p => p.id === id && p.empresaId === empresaId,
      );

      if (index === -1) {
        throw new NotFoundException('Produto não encontrado');
      }

      this.mockProdutos[index] = {
        ...this.mockProdutos[index],
        ...updateProdutoDto,
        updatedAt: new Date().toISOString(),
      };

      return this.mockProdutos[index];
    }

    // Verificar se o produto existe e pertence à empresa
    await this.findOne(id, empresaId);

    return this.prisma.produto.update({
      where: { id },
      data: updateProdutoDto,
    });
  }

  async remove(id: string, empresaId: string) {
    if (this.useMockData) {
      const index = this.mockProdutos.findIndex(
        p => p.id === id && p.empresaId === empresaId,
      );

      if (index === -1) {
        throw new NotFoundException('Produto não encontrado');
      }

      this.mockProdutos[index] = {
        ...this.mockProdutos[index],
        ativo: false,
        updatedAt: new Date().toISOString(),
      };

      return this.mockProdutos[index];
    }

    // Verificar se o produto existe e pertence à empresa
    await this.findOne(id, empresaId);

    // Soft delete - apenas marca como inativo
    return this.prisma.produto.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async hardRemove(id: string, empresaId: string) {
    if (this.useMockData) {
      const index = this.mockProdutos.findIndex(
        p => p.id === id && p.empresaId === empresaId,
      );

      if (index === -1) {
        throw new NotFoundException('Produto não encontrado');
      }

      this.mockProdutos.splice(index, 1);
      return { success: true };
    }

    // Verificar se o produto existe e pertence à empresa
    await this.findOne(id, empresaId);

    // Hard delete - remove do banco
    return this.prisma.produto.delete({
      where: { id },
    });
  }
}
