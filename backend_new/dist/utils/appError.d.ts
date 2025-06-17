declare class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;
    details?: any;
    constructor(message: string, statusCode: number, details?: any);
}
export default AppError;
