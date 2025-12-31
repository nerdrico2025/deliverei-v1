import { Request, Response, NextFunction } from 'express';
export interface ApiError extends Error {
    statusCode?: number;
    code?: string;
    details?: any;
}
export declare function errorHandler(error: ApiError, req: Request, res: Response, next: NextFunction): void;
export declare function asyncErrorHandler(fn: Function): (req: Request, res: Response, next: NextFunction) => void;
export declare function notFoundHandler(req: Request, res: Response): void;
