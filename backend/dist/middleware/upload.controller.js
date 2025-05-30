"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpload = exports.uploadMultiple = exports.uploadSingle = void 0;
const multer_1 = __importDefault(require("multer"));
// Configure multer for single file upload
const uploadSingle = (fieldName) => {
    const storage = multer_1.default.memoryStorage();
    const upload = (0, multer_1.default)({
        storage,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB max file size
        },
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new Error('Only image files are allowed!'));
            }
            cb(null, true);
        },
    });
    return upload.single(fieldName);
};
exports.uploadSingle = uploadSingle;
// Configure multer for multiple file upload
const uploadMultiple = (fieldName, maxCount) => {
    const storage = multer_1.default.memoryStorage();
    const upload = (0, multer_1.default)({
        storage,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB max file size
            files: maxCount,
        },
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new Error('Only image files are allowed!'));
            }
            cb(null, true);
        },
    });
    return upload.array(fieldName, maxCount);
};
exports.uploadMultiple = uploadMultiple;
// Validate uploaded files
const validateUpload = (req, res, next) => {
    if (!req.file && !req.files) {
        return next(new Error('No file uploaded'));
    }
    next();
};
exports.validateUpload = validateUpload;
