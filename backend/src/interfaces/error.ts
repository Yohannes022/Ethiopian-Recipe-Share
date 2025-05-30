export interface IApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

export interface IValidationError {
  field: string;
  message: string;
}

export interface IAuthError extends IApiError {
  type: 'invalid_credentials' | 'unauthorized' | 'token_expired';
}
