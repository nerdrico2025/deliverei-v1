import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

/**
 * Middleware global de tratamento de erros
 */
export function errorHandler(
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const logger = new Logger('ErrorHandler');
  
  // Log do erro
  logger.error(`Erro na rota ${req.method} ${req.path}:`, {
    error: error.message,
    stack: error.stack,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Determinar status code
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Erro interno do servidor';
  let code = error.code || 'INTERNAL_ERROR';

  // Tratar erros específicos
  if (error.message.includes('EADDRINUSE')) {
    statusCode = 503;
    message = 'Porta já está em uso. Verifique se outro serviço está rodando na mesma porta.';
    code = 'PORT_IN_USE';
  } else if (error.message.includes('ECONNREFUSED')) {
    statusCode = 503;
    message = 'Falha na conexão. Verifique se o serviço está rodando.';
    code = 'CONNECTION_REFUSED';
  } else if (error.message.includes('ENOTFOUND')) {
    statusCode = 503;
    message = 'Serviço não encontrado. Verifique a configuração de rede.';
    code = 'SERVICE_NOT_FOUND';
  }

  // Resposta padronizada
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

/**
 * Middleware para capturar erros assíncronos
 */
export function asyncErrorHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Middleware para tratar rotas não encontradas
 */
export function notFoundHandler(req: Request, res: Response) {
  const error: ApiError = new Error(`Rota ${req.method} ${req.path} não encontrada`);
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