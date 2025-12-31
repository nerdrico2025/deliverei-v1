"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.asyncErrorHandler = asyncErrorHandler;
exports.notFoundHandler = notFoundHandler;
const common_1 = require("@nestjs/common");
function errorHandler(error, req, res, next) {
    const logger = new common_1.Logger('ErrorHandler');
    logger.error(`Erro na rota ${req.method} ${req.path}:`, {
        error: error.message,
        stack: error.stack,
        body: req.body,
        params: req.params,
        query: req.query,
    });
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Erro interno do servidor';
    let code = error.code || 'INTERNAL_ERROR';
    if (error.message.includes('EADDRINUSE')) {
        statusCode = 503;
        message = 'Porta já está em uso. Verifique se outro serviço está rodando na mesma porta.';
        code = 'PORT_IN_USE';
    }
    else if (error.message.includes('ECONNREFUSED')) {
        statusCode = 503;
        message = 'Falha na conexão. Verifique se o serviço está rodando.';
        code = 'CONNECTION_REFUSED';
    }
    else if (error.message.includes('ENOTFOUND')) {
        statusCode = 503;
        message = 'Serviço não encontrado. Verifique a configuração de rede.';
        code = 'SERVICE_NOT_FOUND';
    }
    const errorResponse = {
        success: false,
        error: {
            code,
            message,
            timestamp: new Date().toISOString(),
            path: req.path,
            method: req.method,
            ...(process.env.NODE_ENV === 'development' && {
                stack: error.stack,
                details: error.details
            })
        }
    };
    res.status(statusCode).json(errorResponse);
}
function asyncErrorHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
function notFoundHandler(req, res) {
    const error = new Error(`Rota ${req.method} ${req.path} não encontrada`);
    error.statusCode = 404;
    error.code = 'ROUTE_NOT_FOUND';
    const errorResponse = {
        success: false,
        error: {
            code: error.code,
            message: error.message,
            timestamp: new Date().toISOString(),
            path: req.path,
            method: req.method,
            availableRoutes: [
                'GET /api/health',
                'POST /api/auth/login',
                'POST /api/auth/cadastro-empresa',
                'GET /api/produtos',
                'POST /api/produtos'
            ]
        }
    };
    res.status(404).json(errorResponse);
}
//# sourceMappingURL=error-handler.js.map