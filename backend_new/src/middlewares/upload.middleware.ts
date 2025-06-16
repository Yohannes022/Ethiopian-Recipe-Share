import multer from 'multer';
import { Request } from 'express';
import AppError from '@/utils/appError';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    console.log('Processing file upload:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    if (!file.mimetype.startsWith('image/')) {
      console.log('Rejected file - not an image:', file.mimetype);
      return cb(new AppError('Only image files are allowed!', 400));
    }
    
    cb(null, true);
  } catch (error: unknown) {
    console.error('Error in file filter:', error);
    if (error instanceof Error) {
      cb(error);
    } else {
      cb(new Error('An unknown error occurred during file upload'));
    }
  }
};

// Configure multer with error handling
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  }
});

// Add error handling middleware for multer
const handleMulterErrors = (err: any, req: Request, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File too large. Maximum size is 5MB.', 400));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new AppError('Too many files. Only one file is allowed.', 400));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new AppError('Unexpected field in form data.', 400));
    }
  } else if (err) {
    // An unknown error occurred
    console.error('File upload error:', err);
    return next(new AppError('Error uploading file.', 500));
  }
  // No error, proceed to next middleware
  next();
};

export { upload, handleMulterErrors };
