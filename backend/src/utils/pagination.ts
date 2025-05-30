import { FilterQuery } from 'mongoose';
import { BadRequestError } from './api-error';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export const getPaginationOptions = (query: any): Required<PaginationOptions> => {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(query.limit as string) || 10)
  );
  const sortBy = (query.sortBy as string) || 'createdAt';
  const sortOrder = (query.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';

  return {
    page,
    limit,
    sortBy,
    sortOrder,
  };
};

export const paginate = async <T>(
  model: any,
  query: FilterQuery<any> = {},
  options: PaginationOptions
): Promise<PaginationResult<T>> => {
  const { page, limit, sortBy, sortOrder } = options;
  const skip = (page - 1) * limit;
  const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  // Validate page number
  if (page < 1) {
    throw new BadRequestError('Page number must be greater than 0');
  }

  // Validate limit
  if (limit < 1 || limit > 100) {
    throw new BadRequestError('Limit must be between 1 and 100');
  }

  const [total, data] = await Promise.all([
    model.countDocuments(query),
    model
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrevious = page > 1;

  return {
    data: data as T[],
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrevious,
    },
  };
};

export const getPaginationLinks = (
  path: string,
  meta: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  },
  query: Record<string, any> = {}
) => {
  const { page, limit, totalPages, hasNext, hasPrevious } = meta;
  
  // Remove pagination params from query to avoid duplication
  const { page: _, limit: __, sortBy, sortOrder, ...restQuery } = query;
  
  const baseUrl = `${path}?`;
  const queryParams = new URLSearchParams();
  
  // Add all remaining query parameters
  Object.entries(restQuery).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  const links: {
    self: string;
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
  } = {
    self: `${baseUrl}${queryParams.toString()}&page=${page}&limit=${limit}`,
  };

  if (hasPrevious) {
    links.first = `${baseUrl}${queryParams.toString()}&page=1&limit=${limit}`;
    links.prev = `${baseUrl}${queryParams.toString()}&page=${page - 1}&limit=${limit}`;
  }

  if (hasNext) {
    links.next = `${baseUrl}${queryParams.toString()}&page=${page + 1}&limit=${limit}`;
    links.last = `${baseUrl}${queryParams.toString()}&page=${totalPages}&limit=${limit}`;
  }

  return links;
};