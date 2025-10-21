import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });

  // Prefixo global para todas as rotas
  app.setGlobalPrefix('api');

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 Servidor rodando em: http://localhost:${port}`);
  logger.log(`📚 API disponível em: http://localhost:${port}/api`);
  logger.log(`✨ Ambiente: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();