import { Document, Model, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { IBaseRepository } from '../interfaces/base-repository.interface';

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async create(doc: Partial<T>): Promise<T> {
    return this.model.create(doc);
  }

  async findById(id: string, projection?: any): Promise<T | null> {
    return this.model.findById(id, projection).exec();
  }

  async findOne(
    filter: FilterQuery<T>,
    projection?: any,
    options?: QueryOptions
  ): Promise<T | null> {
    return this.model.findOne(filter, projection, options).exec();
  }

  async find(
    filter: FilterQuery<T> = {},
    projection?: any,
    options?: QueryOptions
  ): Promise<T[]> {
    return this.model.find(filter, projection, options).exec();
  }

  async update(
    id: string,
    update: UpdateQuery<T>,
    options: QueryOptions = { new: true, runValidators: true }
  ): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, options).exec();
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).exec();
    return count > 0;
  }

  async paginate(
    filter: FilterQuery<T> = {},
    options: {
      page?: number;
      limit?: number;
      sort?: any;
      select?: string;
      populate?: any;
    } = {}
  ): Promise<{ data: T[]; total: number; page: number; pages: number }> {
    const { page = 1, limit = 10, sort, select, populate } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .select(select)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate(populate)
        .exec(),
      this.count(filter),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      data,
      total,
      page: Number(page),
      pages,
    };
  }
}
