
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
import { Role } from '@prisma/client';

@Controller('cupons')
@UseGuards(JwtAuthGuard)
export class CuponsController {
  constructor(private readonly cuponsService: CuponsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  create(@Body() createCupomDto: CreateCupomDto, @Request() req) {
    return this.cuponsService.create(createCupomDto, req.user.empresaId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  findAll(@Request() req) {
    return this.cuponsService.findAll(req.user.empresaId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  findOne(@Param('id') id: string, @Request() req) {
    return this.cuponsService.findOne(id, req.user.empresaId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  update(
    @Param('id') id: string,
    @Body() updateCupomDto: UpdateCupomDto,
    @Request() req,
  ) {
    return this.cuponsService.update(id, updateCupomDto, req.user.empresaId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  remove(@Param('id') id: string, @Request() req) {
    return this.cuponsService.remove(id, req.user.empresaId);
  }

  @Post('validar')
  validar(@Body() validarCupomDto: ValidarCupomDto, @Request() req) {
    return this.cuponsService.validar(validarCupomDto, req.user.empresaId);
  }
}
