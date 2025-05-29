import { Response } from 'express';

export interface IApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  error?: {
    code?: string | number;
    message: string;
    details?: any[];
    stack?: string;
  };
}

export interface IApiResponseOptions {
  statusCode?: number;
  message?: string;
  meta?: any;
  sendAsJson?: boolean;
}

export type SendResponse = <T = any>(
  res: Response,
  data: T,
  options?: IApiResponseOptions
) => Response;
