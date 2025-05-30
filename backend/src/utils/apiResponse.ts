import { IApiResponse, IErrorResponse } from '@/interfaces';

export class ApiResponse {
  static success<T>(data: T, message?: string): IApiResponse<T> {
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
    };
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): IApiResponse<T[]> {
    return {
      status: 'success',
      message: 'Request successful',
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
