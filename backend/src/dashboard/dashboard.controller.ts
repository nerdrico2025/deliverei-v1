
import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('api/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
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
  ) {
    return this.dashboardService.getGraficoVendas(req.user.empresaId, periodo);
  }

  @Get('produtos-populares')
  getProdutosPopulares(@Request() req, @Query('limit') limit: string = '10') {
    return this.dashboardService.getProdutosPopulares(
      req.user.empresaId,
      parseInt(limit, 10),
    );
  }
}
