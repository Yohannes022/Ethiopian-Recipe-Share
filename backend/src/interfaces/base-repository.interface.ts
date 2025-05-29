import { Document, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';

export interface IBaseRepository<T extends Document> {
  create(doc: Partial<T>): Promise<T>;
  findById(id: string, projection?: any): Promise<T | null>;
  findOne(
    filter: FilterQuery<T>,
    projection?: any,
    options?: QueryOptions
  ): Promise<T | null>;
  find(
    filter: FilterQuery<T>,
    projection?: any,
    options?: QueryOptions
  ): Promise<T[]>;
  update(
    id: string,
    update: UpdateQuery<T>,
    options?: QueryOptions
  ): Promise<T | null>;
  delete(id: string): Promise<T | null>;
  count(filter?: FilterQuery<T>): Promise<number>;
  exists(filter: FilterQuery<T>): Promise<boolean>;
  paginate(
    filter?: FilterQuery<T>,
    options?: {
      page?: number;
      limit?: number;
      sort?: any;
      select?: string;
      populate?: any;
    }
  ): Promise<{ data: T[]; total: number; page: number; pages: number }>;
}
