"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    static success(data, message) {
        return {
            status: 'success',
            message: message || 'Request successful',
            data,
        };
    }
    static error(error, details) {
        return {
            status: 'error',
            message: error,
            details,
            data: null
        };
    }
    static paginated(data, page, limit, total) {
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
exports.ApiResponse = ApiResponse;
