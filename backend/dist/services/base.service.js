"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
class BaseService {
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        return this.model.create(data);
    }
    async findById(id) {
        return this.model.findById(id);
    }
    async findAll(query = {}, options = {}) {
        return this.model.find(query, null, options).lean().exec();
    }
    async update(id, data) {
        return this.model.findByIdAndUpdate(id, data, { new: true });
    }
    async delete(id) {
        return this.model.findByIdAndDelete(id);
    }
    async count(query = {}) {
        return this.model.countDocuments(query);
    }
    async paginate(query = {}, options = {}) {
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
exports.BaseService = BaseService;
