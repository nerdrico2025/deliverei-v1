
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AssinaturasService } from './assinaturas.service';
import { CreateAssinaturaDto } from './dto/create-assinatura.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('api/assinaturas')
@UseGuards(JwtAuthGuard)
export class AssinaturasController {
  constructor(private readonly assinaturasService: AssinaturasService) {}

  @Get('planos')
  async listarPlanos() {
    return this.assinaturasService.listarPlanos();
  }

  @Post('checkout')
  async criarCheckout(@Body() dto: CreateAssinaturaDto, @Request() req) {
    return this.assinaturasService.criarCheckout(dto, req.user.empresaId);
  }

  @Get('minha')
  async buscarMinhaAssinatura(@Request() req) {
    return this.assinaturasService.buscarAssinaturaPorEmpresa(
      req.user.empresaId,
    );
  }

  @Post('cancelar')
  @HttpCode(HttpStatus.OK)
  async cancelarAssinatura(@Request() req) {
    return this.assinaturasService.cancelarAssinatura(req.user.empresaId);
  }

  @Post('reativar')
  @HttpCode(HttpStatus.OK)
  async reativarAssinatura(@Request() req) {
    return this.assinaturasService.reativarAssinatura(req.user.empresaId);
  }

  @Get('historico')
  async buscarHistorico(@Request() req) {
    return this.assinaturasService.buscarHistoricoPagamentos(
      req.user.empresaId,
    );
  }
}
