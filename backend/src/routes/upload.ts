import { Router } from 'express';
import { protect } from '../middleware/auth';
import { uploadSingle, uploadMultiple, validateUpload } from '../middleware/upload.controller';
import { deleteFile } from '../controllers/upload.controller';
import { BadRequestError } from '../utils/apiError';

const router = Router();

// Upload single file
router.post(
  '/upload',
  protect,
  uploadSingle('file'),
  validateUpload,
  async (req: any, res: any, next: any) => {
    try {
      if (!req.file) {
        throw new BadRequestError('No file uploaded');
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
  }
);

// Upload multiple files
router.post(
  '/upload/multiple',
  protect,
  uploadMultiple('files', 5),
  validateUpload,
  async (req: any, res: any, next: any) => {
    try {
      if (!req.files) {
        throw new BadRequestError('No files uploaded');
      }

      res.status(200).json({
        status: 'success',
        data: {
          files: req.files,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete uploaded file
router.delete(
  '/upload/:filename',
  protect,
  async (req: any, res: any, next: any) => {
    try {
      const { filename } = req.params;
      await deleteFile(filename);

      res.status(200).json({
        status: 'success',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
