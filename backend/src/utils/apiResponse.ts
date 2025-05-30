import { IResponse } from '@/interfaces/common';
import { IPagination } from '@/interfaces/common';

interface IErrorResponse extends IResponse<null> {
  details?: any;
}

export class ApiResponse {
  static success<T>(data: T, message?: string): IResponse<T> {
    return {
      status: 'success',
      message: message || 'Request successful',
      data,
    };
  }

  static error(error: string, details?: any): IErrorResponse {
    return {
      status: 'error',
      message: error,
      details,
      data: null
    };
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): IResponse<T[]> & { pagination: IPagination } {
    return {
      status: 'success',
      message: 'Request successful',
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        results: data.length
      },
    };
  }
}
