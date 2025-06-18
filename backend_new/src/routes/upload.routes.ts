import express from 'express';
import { uploadImage, deleteFile } from '../controllers/upload.controller';
import multer from 'multer';
import { protect } from '../middlewares/auth.middleware';

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const router = express.Router();

// Upload endpoints
router.post('/image', protect, upload.single('image'), uploadImage);
router.delete('/:filename', protect, deleteFile);

// Serve uploaded files
router.use(express.static('uploads'));

export default router;
