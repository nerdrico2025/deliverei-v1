import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { checkPortStatus, findAvailablePort } from './utils/port-checker';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import * as Sentry from '@sentry/node';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    // Verificar porta antes de inicializar
    const desiredPort = parseInt(process.env.PORT || '3002', 10);
    const portStatus = await checkPortStatus(desiredPort);
    
    let finalPort = desiredPort;
    
    if (!portStatus.available) {
      logger.warn(`⚠️  ${portStatus.message}`);
      logger.log('🔍 Procurando porta disponível...');
      
      try {
        finalPort = await findAvailablePort(desiredPort);
        logger.log(`✅ Porta alternativa encontrada: ${finalPort}`);
      } catch (error) {
        logger.error('❌ Nenhuma porta disponível encontrada');
        logger.error('💡 Sugestões:');
        logger.error('   1. Pare outros serviços rodando nas portas 3002-3012');
        logger.error('   2. Use uma porta específica: PORT=4000 npm run start:dev');
        logger.error('   3. Verifique processos em execução: lsof -i :3002');
        process.exit(1);
      }
    } else {
      logger.log(`✅ ${portStatus.message}`);
    }

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
    });
    const app = await NestFactory.create(AppModule);

    // Filtro global de exceções para respostas padronizadas
    app.useGlobalFilters(new AllExceptionsFilter());

    // Habilitar CORS
    const defaultOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'https://deliverei.com.br',
      'https://www.deliverei.com.br',
    ];
    const rawEnvOrigins = process.env.CORS_ORIGIN;
    const envOrigins = rawEnvOrigins
      ? rawEnvOrigins.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const corsOrigins = Array.from(new Set([...(envOrigins.length > 0 ? envOrigins : []), ...defaultOrigins]));

    app.enableCors({
      origin: (origin, callback) => {
        // Permitir chamadas sem origin (ex.: curl, healthchecks)
        if (!origin) return callback(null, true);
        const allowByPattern =
          /^https?:\/\/([a-z0-9-]+\.)*deliverei\.com\.br$/i.test(origin) ||
          /^https?:\/\/localhost:\d+$/i.test(origin) ||
          corsOrigins.includes(origin);
        if (allowByPattern) return callback(null, true);
        // Em desenvolvimento, logar e negar explicitamente
        logger.warn(`CORS: origin não permitido: ${origin}`);
        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Tenant-Slug', 'x-tenant-slug'],
    });

    // Garantir headers CORS sempre presentes e OPTIONS respondido corretamente
    app.use((req, res, next) => {
      const origin = req.headers.origin as string | undefined;
      res.header('X-Custom-Test', '1');
      if (origin) {
        res.header('X-Debug-Origin', origin);
      }
      res.header('X-Debug-CorsOrigins', JSON.stringify(corsOrigins));
      const originAllowed =
        !!origin &&
        (
          corsOrigins.includes(origin) ||
          /^https?:\/\/([a-z0-9-]+\.)*deliverei\.com\.br$/i.test(origin) ||
          /^https?:\/\/localhost:\d+$/i.test(origin)
        );
      if (originAllowed) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Vary', 'Origin');
        res.header('Access-Control-Allow-Credentials', 'true');
      }
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,X-Tenant-Slug,x-tenant-slug');
      if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
      }
      next();
    });

    // Prefixo global para todas as rotas
    app.setGlobalPrefix('api');

    // Pipes globais de validação
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }));

    await app.listen(finalPort);
    logger.log(`🚀 Backend iniciado em http://localhost:${finalPort}/api`);

  } catch (error) {
    logger.error('Erro ao iniciar a aplicação:', error);
    Sentry.captureException(error as any);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  const logger = new Logger('UncaughtException');
  logger.error('Erro não capturado:', error);
  Sentry.captureException(error as any);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  const logger = new Logger('UnhandledRejection');
  logger.error('Promise rejeitada não tratada:', reason);
  Sentry.captureException(reason as any);
  process.exit(1);
});

bootstrap();
