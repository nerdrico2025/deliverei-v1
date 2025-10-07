import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto, UpdateProdutoDto } from './dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('produtos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  @Roles(Role.ADMIN_EMPRESA, Role.SUPER_ADMIN)
  create(
    @Body() createProdutoDto: CreateProdutoDto,
    @CurrentUser('empresaId') empresaId: string,
  ) {
    return this.produtosService.create(createProdutoDto, empresaId);
  }

  @Get()
  @Roles(Role.ADMIN_EMPRESA, Role.SUPER_ADMIN)
  findAll(
    @CurrentUser('empresaId') empresaId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('categoria') categoria?: string,
    @Query('search') search?: string,
    @Query('ativo', new DefaultValuePipe(undefined)) ativo?: boolean,
  ) {
    return this.produtosService.findAll(
      empresaId,
      page,
      limit,
      categoria,
      search,
      ativo,
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN_EMPRESA, Role.SUPER_ADMIN)
  findOne(
    @Param('id') id: string,
    @CurrentUser('empresaId') empresaId: string,
  ) {
    return this.produtosService.findOne(id, empresaId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN_EMPRESA, Role.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateProdutoDto: UpdateProdutoDto,
    @CurrentUser('empresaId') empresaId: string,
  ) {
    return this.produtosService.update(id, updateProdutoDto, empresaId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN_EMPRESA, Role.SUPER_ADMIN)
  remove(
    @Param('id') id: string,
    @CurrentUser('empresaId') empresaId: string,
  ) {
    return this.produtosService.remove(id, empresaId);
  }

  @Delete(':id/hard')
  @Roles(Role.SUPER_ADMIN)
  hardRemove(
    @Param('id') id: string,
    @CurrentUser('empresaId') empresaId: string,
  ) {
    return this.produtosService.hardRemove(id, empresaId);
  }
}
