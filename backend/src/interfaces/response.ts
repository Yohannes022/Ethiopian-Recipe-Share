import { IResponse } from './common';

export interface IApiResponse<T> extends IResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IErrorResponse extends IResponse<null> {
  error?: string;
  details?: any;
}
