import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { NotificacoesService } from './notificacoes.service';
import { CreateNotificacaoDto, UpdateNotificacaoDto } from './dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

// Enum TipoUsuario como constantes para compatibilidade com SQLite
const TipoUsuario = {
  CLIENTE: 'CLIENTE',
  ADMIN_EMPRESA: 'ADMIN_EMPRESA',
  SUPER_ADMIN: 'SUPER_ADMIN'
} as const;

@Controller('notificacoes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  /**
   * POST /api/notificacoes - Criar notificação
   * Apenas ADMIN_EMPRESA e SUPER_ADMIN podem criar notificações
   */
  @Post()
  @Roles(TipoUsuario.ADMIN_EMPRESA, TipoUsuario.SUPER_ADMIN)
  create(@Body() createNotificacaoDto: CreateNotificacaoDto) {
    return this.notificacoesService.create(createNotificacaoDto);
  }

  /**
   * GET /api/notificacoes - Listar notificações do usuário
   * Suporta paginação e filtros
   */
  @Get()
  findAll(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('tipo') tipo?: string,
    @Query('lida') lida?: boolean,
  ) {
    return this.notificacoesService.findAll(
      req.user.sub,
      page,
      limit,
      tipo,
      lida,
    );
  }

  /**
   * GET /api/notificacoes/nao-lidas - Contar notificações não lidas
   */
  @Get('nao-lidas')
  countNaoLidas(@Request() req) {
    return this.notificacoesService.countNaoLidas(req.user.sub);
  }

  /**
   * GET /api/notificacoes/:id - Buscar notificação por ID
   */
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.notificacoesService.findOne(id, req.user.sub);
  }

  /**
   * PATCH /api/notificacoes/:id - Atualizar notificação
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificacaoDto: UpdateNotificacaoDto,
    @Request() req,
  ) {
    return this.notificacoesService.update(
      id,
      updateNotificacaoDto,
      req.user.sub,
    );
  }

  /**
   * PATCH /api/notificacoes/:id/marcar-lida - Marcar como lida
   */
  @Patch(':id/marcar-lida')
  marcarComoLida(@Param('id') id: string, @Request() req) {
    return this.notificacoesService.marcarComoLida(id, req.user.sub);
  }

  /**
   * PATCH /api/notificacoes/marcar-todas-lidas - Marcar todas como lidas
   */
  @Patch('marcar-todas-lidas')
  marcarTodasComoLidas(@Request() req) {
    return this.notificacoesService.marcarTodasComoLidas(req.user.sub);
  }

  /**
   * DELETE /api/notificacoes/:id - Deletar notificação
   */
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.notificacoesService.remove(id, req.user.sub);
  }
}
