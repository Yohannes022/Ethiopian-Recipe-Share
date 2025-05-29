import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { ApiError } from '../utils/apiError';

const unlinkFile = promisify(fs.unlink);

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

/**
 * File upload configuration
 */
class FileUploadService {
  // Allowed file types
  private static allowedFileTypes = {
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  };

  // Maximum file size (5MB)
  private static maxFileSize = 5 * 1024 * 1024;

  /**
   * File filter
   */
  private static fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (this.allowedFileTypes[file.mimetype as keyof typeof this.allowedFileTypes]) {
      cb(null, true);
    } else {
      cb(
        new ApiError(
          400,
          `Invalid file type. Only ${Object.values(this.allowedFileTypes).join(
            ', '
          )} are allowed.`
        )
      );
    }
  };

  /**
   * Configure storage
   */
  private static getStorage(folder: string) {
    return multer.diskStorage({
      destination: (
        req: Request,
        file: Express.Multer.File,
        cb: DestinationCallback
      ) => {
        const uploadDir = path.join(__dirname, `../../uploads/${folder}`);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
      },
      filename: (
        req: Request,
        file: Express.Multer.File,
        cb: FileNameCallback
      ) => {
        const ext = this.allowedFileTypes[file.mimetype as keyof typeof this.allowedFileTypes] || '';
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}.${ext}`);
      },
    });
  }

  /**
   * Get multer upload middleware
   */
  static getUploadMiddleware(folder: string, fieldName: string, maxCount = 1) {
    return multer({
      storage: this.getStorage(folder),
      fileFilter: this.fileFilter,
      limits: {
        fileSize: this.maxFileSize,
        files: maxCount,
      },
    }).array(fieldName, maxCount);
  }

  /**
   * Get single file upload middleware
   */
  static getSingleUpload(folder: string, fieldName: string) {
    return multer({
      storage: this.getStorage(folder),
      fileFilter: this.fileFilter,
      limits: {
        fileSize: this.maxFileSize,
      },
    }).single(fieldName);
  }

  /**
   * Get multiple files upload middleware
   */
  static getMultipleUpload(
    folder: string,
    fieldName: string,
    maxCount = 5
  ) {
    return multer({
      storage: this.getStorage(folder),
      fileFilter: this.fileFilter,
      limits: {
        fileSize: this.maxFileSize,
        files: maxCount,
      },
    }).array(fieldName, maxCount);
  }

  /**
   * Handle file upload
   */
  static async handleFileUpload(
    req: Request,
    folder: string,
    fieldName: string,
    options: {
      single?: boolean;
      maxCount?: number;
    } = { single: true, maxCount: 1 }
  ): Promise<Express.Multer.File | Express.Multer.File[] | undefined> {
    return new Promise((resolve, reject) => {
      const upload = options.single
        ? this.getSingleUpload(folder, fieldName)
        : this.getMultipleUpload(folder, fieldName, options.maxCount);

      upload(req as any, {} as any, (err: any) => {
        if (err) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return reject(
              new ApiError(400, 'File size exceeds the 5MB limit')
            );
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return reject(
              new ApiError(
                400,
                `Maximum ${options.maxCount} files are allowed`
              )
            );
          }
          return reject(new ApiError(400, err.message));
        }

        if (!req.files || (options.single && !req.file)) {
          return resolve(undefined);
        }

        resolve(options.single ? req.file : req.files);
      });
    });
  }

  /**
   * Delete file
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      await unlinkFile(filePath);
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
      throw new ApiError(500, 'Error deleting file');
    }
  }

  /**
   * Generate file URL
   */
  static generateFileUrl(filename: string, folder: string): string {
    return `${process.env.API_URL}/uploads/${folder}/${filename}`;
  }

  /**
   * Validate file type
   */
  static validateFileType(
    file: Express.Multer.File,
    allowedTypes: string[]
  ): boolean {
    return allowedTypes.includes(file.mimetype);
  }

  /**
   * Get file extension from mimetype
   */
  static getFileExtension(mimetype: string): string | undefined {
    return this.allowedFileTypes[mimetype as keyof typeof this.allowedFileTypes];
  }

  /**
   * Generate unique filename
   */
  static generateUniqueFilename(originalname: string): string {
    const ext = path.extname(originalname);
    return `${uuidv4()}${ext}`;
  }
}

export default FileUploadService;
