import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PedidosModule } from './pedidos/pedidos.module';
import { AuthModule } from './modules/auth/auth.module';
import { PublicModule } from './modules/public/public.module';
import { ProdutosModule } from './modules/produtos/produtos.module';
import { ThemeModule } from './modules/theme/theme.module';
import { PagamentosModule } from './modules/pagamentos/pagamentos.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { CategoriasModule } from './modules/categorias/categorias.module';
import { StorageModule } from './modules/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    PedidosModule,
    AuthModule,
    PublicModule,
    ProdutosModule,
    ThemeModule,
    PagamentosModule,
    WebhooksModule,
    CategoriasModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
