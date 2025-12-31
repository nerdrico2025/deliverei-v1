import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CategoriasService } from './categorias.service';

@Controller('v1/categorias')
@UseGuards(JwtAuthGuard)
export class CategoriasController {
  constructor(private readonly service: CategoriasService) {}

  @Get()
  async listar(@Request() req) {
    return this.service.listarPorEmpresa(req.user.empresaId);
  }

  @Post()
  async adicionar(@Body() body: { nome: string }, @Request() req) {
    return this.service.adicionar(req.user.empresaId, body?.nome);
  }
}
