
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AvaliacoesService } from './avaliacoes.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('avaliacoes')
@UseGuards(JwtAuthGuard)
export class AvaliacoesController {
  constructor(private readonly avaliacoesService: AvaliacoesService) {}

  @Post()
  create(@Body() createAvaliacaoDto: CreateAvaliacaoDto, @Request() req) {
    return this.avaliacoesService.create(createAvaliacaoDto, req.user.sub, req.user.empresaId);
  }

  @Get('produto/:produtoId')
  findByProduto(@Param('produtoId') produtoId: string, @Request() req) {
    return this.avaliacoesService.findByProduto(produtoId, req.user.empresaId);
  }

  @Get('usuario')
  findByUsuario(@Request() req) {
    return this.avaliacoesService.findByUsuario(req.user.sub, req.user.empresaId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.avaliacoesService.remove(id, req.user.sub, req.user.empresaId);
  }
}
