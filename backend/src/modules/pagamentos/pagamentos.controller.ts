
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PagamentosService } from './pagamentos.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/pagamentos')
@UseGuards(JwtAuthGuard)
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Post('criar')
  async criarPagamento(@Body() dto: CreatePagamentoDto, @Request() req) {
    return this.pagamentosService.criarPagamento(dto, req.user.empresaId);
  }

  @Get(':id')
  async buscarPagamento(@Param('id') id: string, @Request() req) {
    return this.pagamentosService.buscarPagamento(id, req.user.empresaId);
  }

  @Get('pedido/:pedidoId')
  async buscarPagamentosPorPedido(
    @Param('pedidoId') pedidoId: string,
    @Request() req,
  ) {
    return this.pagamentosService.buscarPagamentosPorPedido(
      pedidoId,
      req.user.empresaId,
    );
  }

  @Get()
  async buscarPagamentosEmpresa(@Request() req) {
    return this.pagamentosService.buscarPagamentosEmpresa(req.user.empresaId);
  }

  @Post(':id/cancelar')
  @HttpCode(HttpStatus.OK)
  async cancelarPagamento(@Param('id') id: string, @Request() req) {
    return this.pagamentosService.cancelarPagamento(id, req.user.empresaId);
  }
}
