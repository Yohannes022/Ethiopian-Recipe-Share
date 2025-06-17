"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMulterErrors = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const appError_1 = __importDefault(require("@/utils/appError"));
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    try {
        console.log('Processing file upload:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });
        if (!file.mimetype.startsWith('image/')) {
            console.log('Rejected file - not an image:', file.mimetype);
            return cb(new appError_1.default('Only image files are allowed!', 400));
        }
        cb(null, true);
    }
    catch (error) {
        console.error('Error in file filter:', error);
        if (error instanceof Error) {
            cb(error);
        }
        else {
            cb(new Error('An unknown error occurred during file upload'));
        }
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
});
exports.upload = upload;
const handleMulterErrors = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new appError_1.default('File too large. Maximum size is 5MB.', 400));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return next(new appError_1.default('Too many files. Only one file is allowed.', 400));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(new appError_1.default('Unexpected field in form data.', 400));
        }
    }
    else if (err) {
        console.error('File upload error:', err);
        return next(new appError_1.default('Error uploading file.', 500));
    }
    next();
};
exports.handleMulterErrors = handleMulterErrors;
//# sourceMappingURL=upload.middleware.js.map