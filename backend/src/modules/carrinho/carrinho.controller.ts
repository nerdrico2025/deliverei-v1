
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CarrinhoService } from './carrinho.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { CurrentEmpresa } from '../../decorators/current-empresa.decorator';
import {
  AdicionarItemCarrinhoDto,
  AtualizarItemCarrinhoDto,
  CheckoutDto,
} from './dto';

@ApiTags('Carrinho')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('carrinho')
export class CarrinhoController {
  constructor(private readonly carrinhoService: CarrinhoService) {}

  @Get()
  @ApiOperation({ summary: 'Obter carrinho atual do usuário' })
  async obterCarrinho(
    @CurrentUser('id') usuarioId: string,
    @CurrentEmpresa() empresaId: string,
  ) {
    return this.carrinhoService.obterCarrinho(usuarioId, empresaId);
  }

  @Post('itens')
  @ApiOperation({ summary: 'Adicionar item ao carrinho' })
  async adicionarItem(
    @CurrentUser('id') usuarioId: string,
    @CurrentEmpresa() empresaId: string,
    @Body() dto: AdicionarItemCarrinhoDto,
  ) {
    return this.carrinhoService.adicionarItem(usuarioId, empresaId, dto);
  }

  @Patch('itens/:id')
  @ApiOperation({ summary: 'Atualizar item do carrinho' })
  async atualizarItem(
    @CurrentUser('id') usuarioId: string,
    @CurrentEmpresa() empresaId: string,
    @Param('id') itemId: string,
    @Body() dto: AtualizarItemCarrinhoDto,
  ) {
    return this.carrinhoService.atualizarItem(
      usuarioId,
      empresaId,
      itemId,
      dto,
    );
  }

  @Delete('itens/:id')
  @ApiOperation({ summary: 'Remover item do carrinho' })
  async removerItem(
    @CurrentUser('id') usuarioId: string,
    @CurrentEmpresa() empresaId: string,
    @Param('id') itemId: string,
  ) {
    return this.carrinhoService.removerItem(usuarioId, empresaId, itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Limpar carrinho' })
  async limparCarrinho(
    @CurrentUser('id') usuarioId: string,
    @CurrentEmpresa() empresaId: string,
  ) {
    return this.carrinhoService.limparCarrinho(usuarioId, empresaId);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Finalizar pedido (checkout)' })
  async checkout(
    @CurrentUser('id') usuarioId: string,
    @CurrentEmpresa() empresaId: string,
    @Body() dto: CheckoutDto,
  ) {
    return this.carrinhoService.checkout(usuarioId, empresaId, dto);
  }

  @Get('recomendacoes')
  @ApiOperation({ summary: 'Obter produtos recomendados' })
  async obterRecomendacoes(
    @CurrentUser('id') usuarioId: string,
    @CurrentEmpresa() empresaId: string,
  ) {
    return this.carrinhoService.obterRecomendacoes(usuarioId, empresaId);
  }
}
