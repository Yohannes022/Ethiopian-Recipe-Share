export interface IResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  results: number;
}

export interface IAuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
  photo?: string;
}

export interface IFilterOptions {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: string;
}
