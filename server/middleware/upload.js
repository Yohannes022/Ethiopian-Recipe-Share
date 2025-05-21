const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/errorResponse');
const logger = require('../utils/logger');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed file types
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const allowedFileTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  ...allowedImageTypes,
];

// File filter function
const fileFilter = (req, file, cb) => {
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Unsupported file type: ${file.mimetype}. Allowed types: ${allowedFileTypes.join(', ')}`,
        400,
        'INVALID_FILE_TYPE'
      ),
      false
    );
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// Upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Middleware factory for single file upload
const uploadFile = (fieldName) => (req, res, next) => {
  const uploadSingle = upload.single(fieldName);
  
  uploadSingle(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          new AppError('File too large. Maximum size is 10MB', 413, 'FILE_TOO_LARGE')
        );
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(
          new AppError(`Unexpected field: ${err.field}`, 400, 'INVALID_FIELD')
        );
      }
      return next(err);
    }
    
    // Add file info to request object
    if (req.file) {
      req.file.path = req.file.path.replace(/\\/g, '/'); // Normalize path for Windows
      
      // If it's an image, add additional processing if needed
      if (allowedImageTypes.includes(req.file.mimetype)) {
        // You can add image processing logic here if needed
        // For example, generate thumbnails, compress, etc.
      }
      
      // Log file upload
      logger.info(`File uploaded: ${req.file.filename}`, {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path,
        requestId: req.requestId,
      });
    }
    
    next();
  });
};

// Middleware factory for multiple file uploads
const uploadFiles = (fieldName, maxCount = 5) => (req, res, next) => {
  const uploadMultiple = upload.array(fieldName, maxCount);
  
  uploadMultiple(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          new AppError('One or more files are too large. Maximum size is 10MB per file', 413, 'FILES_TOO_LARGE')
        );
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(
          new AppError(`Unexpected field: ${err.field}`, 400, 'INVALID_FIELD')
        );
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return next(
          new AppError(`Too many files. Maximum allowed: ${maxCount}`, 400, 'TOO_MANY_FILES')
        );
      }
      return next(err);
    }
    
    // Add files info to request object
    if (req.files && req.files.length > 0) {
      req.files = req.files.map(file => {
        file.path = file.path.replace(/\\/g, '/'); // Normalize path for Windows
        return file;
      });
      
      // Log files upload
      logger.info(`${req.files.length} files uploaded`, {
        files: req.files.map(file => ({
          originalName: file.originalname,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype,
          path: file.path,
        })),
        requestId: req.requestId,
      });
    }
    
    next();
  });
};

// Middleware to handle file deletion
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!filePath) return resolve();
    
    const fullPath = path.join(uploadDir, filePath);
    
    fs.unlink(fullPath, (err) => {
      if (err && err.code !== 'ENOENT') {
        logger.error(`Error deleting file ${filePath}:`, err);
        return reject(err);
      }
      logger.info(`File deleted: ${filePath}`);
      resolve();
    });
  });
};

module.exports = {
  uploadFile,
  uploadFiles,
  deleteFile,
  allowedImageTypes,
  allowedFileTypes,
};
