import { Response } from 'express';

type SuccessResponseData = {
  [key: string]: any;
};

type ErrorResponseData = {
  code?: string;
  message: string;
  details?: any;
};

class ApiResponse {
  /**
   * Send a success response
   */
  static success(
    res: Response,
    data: SuccessResponseData = {},
    statusCode: number = 200
  ): Response {
    return res.status(statusCode).json({
      success: true,
      data,
    });
  }

  /**
   * Send an error response
   */
  static error(
    res: Response,
    error: ErrorResponseData | string,
    statusCode: number = 400
  ): Response {
    const response: any = {
      success: false,
      error: typeof error === 'string' ? { message: error } : error,
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send a paginated response
   */
  static paginated(
    res: Response,
    data: any[],
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    },
    statusCode: number = 200
  ): Response {
    return res.status(statusCode).json({
      success: true,
      data,
      pagination: {
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
      },
    });
  }

  /**
   * Send a created response (201)
   */
  static created(
    res: Response,
    data: SuccessResponseData = {},
    message: string = 'Resource created successfully'
  ): Response {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Send a no content response (204)
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send a not found response (404)
   */
  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): Response {
    return this.error(res, { message }, 404);
  }

  /**
   * Send an unauthorized response (401)
   */
  static unauthorized(
    res: Response,
    message: string = 'Unauthorized access'
  ): Response {
    return this.error(res, { message }, 401);
  }

  /**
   * Send a forbidden response (403)
   */
  static forbidden(
    res: Response,
    message: string = 'Forbidden access'
  ): Response {
    return this.error(res, { message }, 403);
  }
}

export default ApiResponse;
