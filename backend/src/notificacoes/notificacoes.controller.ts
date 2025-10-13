
import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificacoesService } from './notificacoes.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('notificacoes')
@UseGuards(JwtAuthGuard)
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @Get()
  findByUsuario(@Request() req) {
    return this.notificacoesService.findByUsuario(req.user.sub);
  }

  @Get('nao-lidas')
  countNaoLidas(@Request() req) {
    return this.notificacoesService.countNaoLidas(req.user.sub);
  }

  @Patch(':id/ler')
  marcarComoLida(@Param('id') id: string, @Request() req) {
    return this.notificacoesService.marcarComoLida(id, req.user.sub);
  }

  @Patch('ler-todas')
  marcarTodasComoLidas(@Request() req) {
    return this.notificacoesService.marcarTodasComoLidas(req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.notificacoesService.remove(id, req.user.sub);
  }
}
