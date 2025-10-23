import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { PublicService } from './public.service';
import { Public } from '../../decorators/public.decorator';

@Controller('public')
@Public()
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get(':slug/info')
  async getLojaInfo(@Param('slug') slug: string) {
    return this.publicService.getLojaBySlug(slug);
  }

  @Get(':slug/produtos')
  async getProdutos(
    @Param('slug') slug: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('categoria') categoria?: string,
    @Query('search') search?: string,
  ) {
    return this.publicService.getProdutosByLoja(slug, page, limit, categoria, search);
  }

  @Get(':slug/produtos/:id')
  async getProdutoById(
    @Param('slug') slug: string,
    @Param('id') id: string,
  ) {
    return this.publicService.getProdutoById(slug, id);
  }

  @Get(':slug/categorias')
  async getCategorias(@Param('slug') slug: string) {
    return this.publicService.getCategorias(slug);
  }
}
