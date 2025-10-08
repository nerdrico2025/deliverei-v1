
import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { PrismaModule } from '../database/prisma.module';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';
import { WhatsappModule } from '../modules/whatsapp/whatsapp.module';

@Module({
  imports: [PrismaModule, NotificacoesModule, WhatsappModule],
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService],
})
export class PedidosModule {}
