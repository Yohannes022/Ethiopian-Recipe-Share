import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define allowed file types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(req.file.mimetype)) {
      await fs.unlink(req.file.path);
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WEBP images are allowed'
      });
    }

    // Create unique filename
    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    const targetPath = path.join(UPLOAD_DIR, filename);

    // Move file to uploads directory
    await fs.rename(req.file.path, targetPath);

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: {
        filename,
        url: `${req.protocol}://${req.get('host')}/uploads/${filename}`
      }
    });
  } catch (error: any) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        // Ignore error if file deletion fails
      }
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: 'Filename is required'
      });
    }

    const filePath = path.join(UPLOAD_DIR, filename);
    
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      res.status(StatusCodes.OK).json({
        success: true,
        data: null
      });
    } catch (err) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: 'File not found'
      });
    }
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message
    });
  }
};
