"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const port_checker_1 = require("./utils/port-checker");
const all_exceptions_filter_1 = require("./filters/all-exceptions.filter");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    try {
        const desiredPort = parseInt(process.env.PORT || '3002', 10);
        const portStatus = await (0, port_checker_1.checkPortStatus)(desiredPort);
        let finalPort = desiredPort;
        if (!portStatus.available) {
            logger.warn(`⚠️  ${portStatus.message}`);
            logger.log('🔍 Procurando porta disponível...');
            try {
                finalPort = await (0, port_checker_1.findAvailablePort)(desiredPort);
                logger.log(`✅ Porta alternativa encontrada: ${finalPort}`);
            }
            catch (error) {
                logger.error('❌ Nenhuma porta disponível encontrada');
                logger.error('💡 Sugestões:');
                logger.error('   1. Pare outros serviços rodando nas portas 3002-3012');
                logger.error('   2. Use uma porta específica: PORT=4000 npm run start:dev');
                logger.error('   3. Verifique processos em execução: lsof -i :3002');
                process.exit(1);
            }
        }
        else {
            logger.log(`✅ ${portStatus.message}`);
        }
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
        const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
        const corsOrigins = process.env.CORS_ORIGIN?.split(',') || defaultOrigins;
        app.enableCors({
            origin: corsOrigins,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Tenant-Slug', 'x-tenant-slug'],
        });
        app.setGlobalPrefix('api');
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            disableErrorMessages: process.env.NODE_ENV === 'production',
        }));
        await app.listen(finalPort);
        logger.log(`🚀 Backend iniciado em http://localhost:${finalPort}/api`);
    }
    catch (error) {
        logger.error('Erro ao iniciar a aplicação:', error);
        process.exit(1);
    }
}
process.on('uncaughtException', (error) => {
    const logger = new common_1.Logger('UncaughtException');
    logger.error('Erro não capturado:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    const logger = new common_1.Logger('UnhandledRejection');
    logger.error('Promise rejeitada não tratada:', reason);
    process.exit(1);
});
bootstrap();
//# sourceMappingURL=main.js.map