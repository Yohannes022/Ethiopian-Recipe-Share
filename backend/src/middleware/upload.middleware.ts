import multer from 'multer';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { mkdir, access, constants } from 'fs/promises';
import { ApiError } from '../utils/apiError';

// Define allowed file types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Configure storage
const storage = multer.diskStorage({
  destination: async (req: Request, file: Express.Multer.File, cb) => {
    const uploadDir = 'uploads/';
    
    try {
      // Check if directory exists, create if it doesn't
      await access(uploadDir, constants.F_OK);
    } catch (err) {
      // Directory doesn't exist, create it
      await mkdir(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// File filter function
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only JPEG, JPG, PNG & WEBP are allowed.'));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Middleware for single file upload
const uploadSingle = (fieldName: string) => 
  upload.single(fieldName);

// Middleware for multiple file uploads
const uploadMultiple = (fieldName: string, maxCount: number = 5) => 
  upload.array(fieldName, maxCount);

// Middleware for mixed file uploads (different fields)
const uploadFields = (fields: multer.Field[]) => 
  upload.fields(fields);

export { uploadSingle, uploadMultiple, uploadFields, upload };
