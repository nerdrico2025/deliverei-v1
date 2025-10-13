
import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { UpdateStatusPedidoDto } from './dto/update-status-pedido.dto';
import { FiltrarPedidosDto } from './dto/filtrar-pedidos.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  findAll(@Query() filtros: FiltrarPedidosDto, @Request() req) {
    return this.pedidosService.findAll(filtros, req.user.empresaId);
  }

  @Get('meus')
  findMeusPedidos(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.pedidosService.findMeusPedidos(
      req.user.sub,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const isAdmin = [Role.SUPER_ADMIN, Role.ADMIN_EMPRESA].includes(req.user.role);
    return this.pedidosService.findOne(
      id,
      req.user.empresaId,
      isAdmin ? undefined : req.user.sub,
    );
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusPedidoDto,
    @Request() req,
  ) {
    return this.pedidosService.updateStatus(id, updateStatusDto, req.user.empresaId);
  }

  @Delete(':id')
  cancel(@Param('id') id: string, @Request() req) {
    const isAdmin = [Role.SUPER_ADMIN, Role.ADMIN_EMPRESA].includes(req.user.role);
    return this.pedidosService.cancel(id, req.user.empresaId, req.user.sub, isAdmin);
  }
}
