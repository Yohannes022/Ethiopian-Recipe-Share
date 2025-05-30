"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const apiError_1 = require("@/utils/apiError");
var UploadMiddleware;
(function (UploadMiddleware) {
    // Configure multer for file uploads
    UploadMiddleware.storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = path_1.default.join(__dirname, '../../uploads');
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
        },
    });
    // File filter
    UploadMiddleware.fileFilter = (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    };
    // Configure multer
    UploadMiddleware.upload = (0, multer_1.default)({
        storage: UploadMiddleware.storage,
        fileFilter: UploadMiddleware.fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB limit
        },
    });
    // Single file upload middleware
    UploadMiddleware.uploadSingle = (fieldName) => {
        return UploadMiddleware.upload.single(fieldName);
    };
    // Multiple file upload middleware
    UploadMiddleware.uploadMultiple = (fieldName, maxCount) => {
        return UploadMiddleware.upload.array(fieldName, maxCount);
    };
    // File upload validation middleware
    UploadMiddleware.validateUpload = (req, res, next) => {
        if (!req.file && !req.files) {
            throw new apiError_1.BadRequestError('No file uploaded');
        }
        // Validate file size
        if (req.file) {
            if (req.file.size > 5 * 1024 * 1024) {
                throw new apiError_1.BadRequestError('File size exceeds 5MB limit');
            }
        }
        else if (req.files) {
            // Handle both array and object formats
            const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
            for (const file of files) {
                if (file.size > 5 * 1024 * 1024) {
                    throw new apiError_1.BadRequestError('File size exceeds 5MB limit');
                }
            }
        }
        next();
    };
    // Delete uploaded file
    UploadMiddleware.deleteFile = async (filePath) => {
        try {
            const uploadDir = path_1.default.join(__dirname, '../../uploads');
            const fullPath = path_1.default.join(uploadDir, filePath);
            await fs_extra_1.default.unlink(fullPath);
        }
        catch (error) {
            console.error('Error deleting file:', error);
        }
    };
})(UploadMiddleware || (UploadMiddleware = {}));
exports.default = UploadMiddleware;
