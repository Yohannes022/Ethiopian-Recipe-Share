import multer from 'multer';
import path from 'path';

// Configure multer for single file upload
const uploadSingle = (fieldName: string) => {
  const storage = multer.memoryStorage();
  const upload = multer({
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

// Configure multer for multiple file upload
const uploadMultiple = (fieldName: string, maxCount: number) => {
  const storage = multer.memoryStorage();
  const upload = multer({
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

// Validate uploaded files
const validateUpload = (req: any, res: any, next: any) => {
  if (!req.file && !req.files) {
    return next(new Error('No file uploaded'));
  }
  next();
};

export { uploadSingle, uploadMultiple, validateUpload };
