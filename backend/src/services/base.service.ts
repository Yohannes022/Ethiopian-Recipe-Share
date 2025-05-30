import { Model } from 'mongoose';

export class BaseService<T> {
  constructor(protected model: Model<T>) {}

  async create(data: any): Promise<T> {
    return this.model.create(data);
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id);
  }

  async findAll(query: any = {}, options: any = {}): Promise<T[]> {
    return this.model.find(query, null, options);
  }

  async update(id: string, data: any): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id);
  }

  async count(query: any = {}): Promise<number> {
    return this.model.countDocuments(query);
  }

  async paginate(query: any = {}, options: any = {}): Promise<any> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.find(query).skip(skip).limit(limit),
      this.model.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
