
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PagamentosController } from './pagamentos.controller';
import { PagamentosService } from './pagamentos.service';
import { AsaasService } from './asaas.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [HttpModule],
  controllers: [PagamentosController],
  providers: [PagamentosService, AsaasService, PrismaService],
  exports: [PagamentosService, AsaasService],
})
export class PagamentosModule {}
