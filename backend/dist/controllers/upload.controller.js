"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.uploadImage = exports.deleteFile = void 0;
const apiError_1 = require("@/utils/apiError");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
// Delete file from storage
const deleteFile = async (filename) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    const filePath = path.join(uploadDir, filename);
    try {
        await fs.unlink(filePath);
    }
    catch (error) {
        throw new apiError_1.NotFoundError('File not found');
    }
};
exports.deleteFile = deleteFile;
// Upload image
const uploadImage = async (req, res, next) => {
    try {
        // Validate file upload
        if (!req.file) {
            throw new apiError_1.BadRequestError('No file uploaded');
        }
        // Check if file is an image
        if (!req.file.mimetype.startsWith('image/')) {
            throw new apiError_1.BadRequestError('File must be an image');
        }
        res.status(200).json({
            status: 'success',
            data: {
                file: req.file,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadImage = uploadImage;
// Delete image
const deleteImage = async (req, res, next) => {
    try {
        const { filename } = req.params;
        if (!filename) {
            throw new apiError_1.BadRequestError('Filename is required');
        }
        // Delete the file from storage
        const uploadDir = path.join(__dirname, '../../uploads');
        const filePath = path.join(uploadDir, filename);
        try {
            await fs.unlink(filePath);
            res.status(200).json({
                status: 'success',
                data: null,
            });
        }
        catch (error) {
            throw new apiError_1.NotFoundError('File not found');
        }
    }
    catch (error) {
        next(error);
    }
};
exports.deleteImage = deleteImage;
