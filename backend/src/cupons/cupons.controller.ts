
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
} from '@nestjs/common';
import { CuponsService } from './cupons.service';
import { CreateCupomDto } from './dto/create-cupom.dto';
import { UpdateCupomDto } from './dto/update-cupom.dto';
import { ValidarCupomDto } from './dto/validar-cupom.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

// Enum TipoUsuario como constantes para compatibilidade com SQLite
const TipoUsuario = {
  CLIENTE: 'CLIENTE',
  ADMIN_EMPRESA: 'ADMIN_EMPRESA',
  SUPER_ADMIN: 'SUPER_ADMIN'
} as const;

@Controller('cupons')
@UseGuards(JwtAuthGuard)
export class CuponsController {
  constructor(private readonly cuponsService: CuponsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(TipoUsuario.SUPER_ADMIN, TipoUsuario.ADMIN_EMPRESA)
  create(@Body() createCupomDto: CreateCupomDto, @Request() req) {
    return this.cuponsService.create(createCupomDto, req.user.empresaId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(TipoUsuario.SUPER_ADMIN, TipoUsuario.ADMIN_EMPRESA)
  findAll(@Request() req) {
    return this.cuponsService.findAll(req.user.empresaId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(TipoUsuario.SUPER_ADMIN, TipoUsuario.ADMIN_EMPRESA)
  findOne(@Param('id') id: string, @Request() req) {
    return this.cuponsService.findOne(id, req.user.empresaId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(TipoUsuario.SUPER_ADMIN, TipoUsuario.ADMIN_EMPRESA)
  update(
    @Param('id') id: string,
    @Body() updateCupomDto: UpdateCupomDto,
    @Request() req,
  ) {
    return this.cuponsService.update(id, updateCupomDto, req.user.empresaId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(TipoUsuario.SUPER_ADMIN, TipoUsuario.ADMIN_EMPRESA)
  remove(@Param('id') id: string, @Request() req) {
    return this.cuponsService.remove(id, req.user.empresaId);
  }

  @Post('validar')
  validar(@Body() validarCupomDto: ValidarCupomDto, @Request() req) {
    return this.cuponsService.validar(validarCupomDto, req.user.empresaId);
  }
}
