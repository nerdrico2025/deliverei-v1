
import { Module } from '@nestjs/common';
import { CarrinhoController } from './carrinho.controller';
import { CarrinhoService } from './carrinho.service';
import { PrismaModule } from '../../database/prisma.module';
import { CuponsModule } from '../../cupons/cupons.module';

@Module({
  imports: [PrismaModule, CuponsModule],
  controllers: [CarrinhoController],
  providers: [CarrinhoService],
  exports: [CarrinhoService],
})
export class CarrinhoModule {}
