import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProdutosModule } from './modules/produtos/produtos.module';
import { PublicModule } from './modules/public/public.module';
import { CarrinhoModule } from './modules/carrinho/carrinho.module';
import { TenantMiddleware } from './middleware/tenant.middleware';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CuponsModule } from './cupons/cupons.module';
import { AvaliacoesModule } from './avaliacoes/avaliacoes.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { AssinaturasModule } from './modules/assinaturas/assinaturas.module';
import { PagamentosModule } from './modules/pagamentos/pagamentos.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    ProdutosModule,
    PublicModule,
    CarrinhoModule,
    CuponsModule,
    AvaliacoesModule,
    NotificacoesModule,
    DashboardModule,
    PedidosModule,
    AssinaturasModule,
    PagamentosModule,
    WhatsappModule,
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*');
  }
}
