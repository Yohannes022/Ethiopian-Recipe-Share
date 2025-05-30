import { Request, Response, NextFunction } from 'express';
import { BadRequestError, NotFoundError } from '@/utils/apiError';
import { protect } from '../middleware/auth';
import * as path from 'path';
import * as fs from 'fs/promises';

// Delete file from storage
export const deleteFile = async (filename: string) => {
  const uploadDir = path.join(__dirname, '../../uploads');
  const filePath = path.join(uploadDir, filename);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    throw new NotFoundError('File not found');
  }
};

// Upload image
export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate file upload
    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }

    // Check if file is an image
    if (!req.file.mimetype.startsWith('image/')) {
      throw new BadRequestError('File must be an image');
    } 

    res.status(200).json({
      status: 'success',
      data: {
        file: req.file,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete image
export const deleteImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      throw new BadRequestError('Filename is required');
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
    } catch (error) {
      throw new NotFoundError('File not found');
    }
  } catch (error) {
    next(error);
  }
};
