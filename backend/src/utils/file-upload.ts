import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { ApiError } from './api-error';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

type UploadOptions = {
  folder?: string;
  allowedFormats?: string[];
  maxFileSize?: number; // in bytes
  transformation?: any[];
  publicId?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
};

export class FileUploadService {
  private static defaultOptions: UploadOptions = {
    folder: 'ethiopian_recipe_share',
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    resourceType: 'auto',
  };

  /**
   * Upload a file from a buffer
   */
  static async uploadFromBuffer(
    buffer: Buffer,
    options: UploadOptions = {}
  ) {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: mergedOptions.folder,
          allowed_formats: mergedOptions.allowedFormats,
          resource_type: mergedOptions.resourceType,
          transformation: mergedOptions.transformation,
          public_id: mergedOptions.publicId,
          chunk_size: 6000000, // 6MB chunks
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new ApiError(500, 'Failed to upload file'));
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              resourceType: result.resource_type,
              bytes: result.bytes,
              width: result.width,
              height: result.height,
            });
          } else {
            reject(new ApiError(500, 'No result from Cloudinary'));
          }
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      const bufferStream = new Readable();
      bufferStream.push(buffer);
      bufferStream.push(null); // Signals the end of the stream
      bufferStream.pipe(uploadStream);
    });
  }

  /**
   * Upload a file from a URL
   */
  static async uploadFromUrl(
    url: string,
    options: UploadOptions = {}
  ) {
    const mergedOptions = { ...this.defaultOptions, ...options };

    try {
      const result = await cloudinary.uploader.upload(url, {
        folder: mergedOptions.folder,
        allowed_formats: mergedOptions.allowedFormats,
        resource_type: mergedOptions.resourceType,
        transformation: mergedOptions.transformation,
        public_id: mergedOptions.publicId,
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        resourceType: result.resource_type,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error('Cloudinary upload from URL error:', error);
      throw new ApiError(500, 'Failed to upload file from URL');
    }
  }

  /**
   * Delete a file from Cloudinary
   */
  static async deleteFile(publicId: string, resourceType: string = 'image') {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });

      if (result.result !== 'ok') {
        console.error('Cloudinary delete error:', result);
        throw new ApiError(500, `Failed to delete file: ${result.result}`);
      }

      return true;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new ApiError(500, 'Failed to delete file');
    }
  }

  /**
   * Generate a signed URL for direct uploads from the client
   */
  static generateUploadSignature(folder: string = 'ethiopian_recipe_share/unsigned') {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      timestamp,
      folder,
    };

    try {
      const signature = cloudinary.utils.api_sign_request(
        params,
        process.env.CLOUDINARY_API_SECRET!
      );

      return {
        signature,
        timestamp,
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        folder,
      };
    } catch (error) {
      console.error('Error generating upload signature:', error);
      throw new ApiError(500, 'Failed to generate upload signature');
    }
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: Express.Multer.File, options: Partial<UploadOptions> = {}) {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    
    // Check file size
    if (file.size > (mergedOptions.maxFileSize || 0)) {
      throw new ApiError(400, `File size must be less than ${(mergedOptions.maxFileSize! / (1024 * 1024)).toFixed(1)}MB`);
    }
    
    // Check file format
    if (fileExtension && mergedOptions.allowedFormats && !mergedOptions.allowedFormats.includes(fileExtension)) {
      throw new ApiError(400, `Invalid file format. Allowed formats: ${mergedOptions.allowedFormats.join(', ')}`);
    }
    
    return true;
  }
}

export const fileUploadService = new FileUploadService();
