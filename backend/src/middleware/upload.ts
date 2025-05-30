import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { BadRequestError } from '@/utils/apiError';
import { Request, Response, NextFunction } from 'express';

namespace UploadMiddleware {
  // Configure multer for file uploads
  export const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      const uploadDir = path.join(__dirname, '../../uploads');
      cb(null, uploadDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });

  // File filter
  export const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

  // Configure multer
  export const upload = multer({
    storage: UploadMiddleware.storage,
    fileFilter: UploadMiddleware.fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  });

  // Single file upload middleware
  export const uploadSingle = (fieldName: string) => {
    return UploadMiddleware.upload.single(fieldName);
  };

  // Multiple file upload middleware
  export const uploadMultiple = (fieldName: string, maxCount: number) => {
    return UploadMiddleware.upload.array(fieldName, maxCount);
  };

  // File upload validation middleware
  export const validateUpload = (req: Request, res: Response, next: NextFunction) => {
    if (!req.file && !req.files) {
      throw new BadRequestError('No file uploaded');
    }

    // Validate file size
    if (req.file) {
      if (req.file.size > 5 * 1024 * 1024) {
        throw new BadRequestError('File size exceeds 5MB limit');
      }
    } else if (req.files) {
      // Handle both array and object formats
      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          throw new BadRequestError('File size exceeds 5MB limit');
        }
      }
    }

    next();
  };

  // Delete uploaded file
  export const deleteFile = async (filePath: string) => {
    try {
      const uploadDir = path.join(__dirname, '../../uploads');
      const fullPath = path.join(uploadDir, filePath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };
}

export default UploadMiddleware;
