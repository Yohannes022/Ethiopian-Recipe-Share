import { Response } from 'express';

export interface IApiError extends Error {
  statusCode: number;
  status: string;
  isOperational?: boolean;
  code?: number | string;
  errors?: any[];
  path?: string;
  value?: any;
  keyValue?: any;
  errors?: Record<string, { message: string }>;
}

export interface IErrorResponse {
  status: 'error';
  message: string;
  error: {
    code?: string | number;
    message: string;
    details?: any[];
    stack?: string;
  };
}

export interface IErrorHandler {
  (err: IApiError, req: any, res: Response, next: any): void;
}

export interface IErrorWithStatus extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}
