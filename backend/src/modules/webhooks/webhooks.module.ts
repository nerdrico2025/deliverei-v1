
import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { PrismaService } from '../../database/prisma.service';
// import { AssinaturasModule } from '../assinaturas/assinaturas.module';
import { PagamentosModule } from '../pagamentos/pagamentos.module';

@Module({
  imports: [/* AssinaturasModule, */ PagamentosModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, PrismaService],
})
export class WebhooksModule {}
