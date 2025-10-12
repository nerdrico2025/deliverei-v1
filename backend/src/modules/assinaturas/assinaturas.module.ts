
import { Module } from '@nestjs/common';
import { AssinaturasController } from './assinaturas.controller';
import { AssinaturasService } from './assinaturas.service';
import { StripeService } from './stripe.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [AssinaturasController],
  providers: [AssinaturasService, StripeService, PrismaService],
  exports: [AssinaturasService, StripeService],
})
export class AssinaturasModule {}
