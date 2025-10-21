
import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

// Enum TipoUsuario como constantes para compatibilidade com SQLite
const TipoUsuario = {
  CLIENTE: 'CLIENTE',
  ADMIN_EMPRESA: 'ADMIN_EMPRESA',
  SUPER_ADMIN: 'SUPER_ADMIN'
} as const;

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(TipoUsuario.SUPER_ADMIN, TipoUsuario.ADMIN_EMPRESA)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('estatisticas')
  getEstatisticas(@Request() req) {
    return this.dashboardService.getEstatisticas(req.user.empresaId);
  }

  @Get('vendas')
  getGraficoVendas(
    @Request() req,
    @Query('periodo') periodo: 'dia' | 'semana' | 'mes' = 'dia',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.dashboardService.getGraficoVendas(req.user.empresaId, periodo, start, end);
  }

  @Get('produtos-populares')
  getProdutosPopulares(@Request() req, @Query('limit') limit: string = '10') {
    return this.dashboardService.getProdutosPopulares(
      req.user.empresaId,
      parseInt(limit, 10),
    );
  }
}
