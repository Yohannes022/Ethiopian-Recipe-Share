import { Request, Response, NextFunction } from 'express';
export interface IErrorResponse {
    status: 'error';
    message: string;
    error: {
        code: string;
        details?: any;
        stack?: string;
    };
    timestamp: string;
}
export declare class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;
    code?: string;
    details?: any;
    constructor(message: string, statusCode: number, code?: string, details?: any);
}
export declare const notFound: (req: Request, res: Response, next: NextFunction) => void;
export declare const errorHandler: (err: any, req: Request, res: Response, _next: NextFunction) => void;
export declare const catchAsync: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
