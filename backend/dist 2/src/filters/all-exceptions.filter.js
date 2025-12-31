"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    constructor() {
        this.logger = new common_1.Logger(AllExceptionsFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Erro interno do servidor';
        let error = 'Internal Server Error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object') {
                message = exceptionResponse.message || exception.message;
                error = exceptionResponse.error || exception.name;
            }
            else {
                message = exceptionResponse;
                error = exception.name;
            }
        }
        else if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            const prismaError = this.handlePrismaError(exception);
            status = prismaError.status;
            message = prismaError.message;
            error = prismaError.error;
        }
        else if (exception instanceof client_1.Prisma.PrismaClientValidationError) {
            status = common_1.HttpStatus.BAD_REQUEST;
            message = 'Erro de validação nos dados enviados';
            error = 'Validation Error';
        }
        else if (exception instanceof Error) {
            message = exception.message;
            error = exception.name;
        }
        this.logger.error(`${status} - ${request.method} ${request.url}`, exception instanceof Error ? exception.stack : JSON.stringify(exception));
        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            error,
            message,
        };
        if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
            errorResponse.stack = exception.stack;
        }
        response.status(status).json(errorResponse);
    }
    handlePrismaError(exception) {
        switch (exception.code) {
            case 'P2002':
                const target = exception.meta?.target || [];
                return {
                    status: common_1.HttpStatus.CONFLICT,
                    message: `Registro duplicado: ${target.join(', ')} já existe`,
                    error: 'Conflict',
                };
            case 'P2025':
                return {
                    status: common_1.HttpStatus.NOT_FOUND,
                    message: 'Registro não encontrado',
                    error: 'Not Found',
                };
            case 'P2003':
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Violação de integridade referencial',
                    error: 'Bad Request',
                };
            case 'P2014':
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Relacionamento obrigatório ausente',
                    error: 'Bad Request',
                };
            default:
                return {
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Erro no banco de dados',
                    error: 'Database Error',
                };
        }
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map