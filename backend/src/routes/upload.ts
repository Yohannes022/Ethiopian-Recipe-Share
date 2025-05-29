import { Router } from 'express';
import { uploadImage, deleteFile } from '../controllers/upload.controller';
import { auth, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     FileUpload:
 *       type: object
 *       properties:
 *         fieldname:
 *           type: string
 *         originalname:
 *           type: string
 *         encoding:
 *           type: string
 *         mimetype:
 *           type: string
 *         size:
 *           type: number
 *         destination:
 *           type: string
 *         filename:
 *           type: string
 *         path:
 *           type: string
 *         url:
 *           type: string
 *     UploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             file:
 *               $ref: '#/components/schemas/FileUpload'
 *             url:
 *               type: string
 */

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: File upload management
 */

// Protected routes - require authentication
router.use(auth);

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: Upload an image
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (max 5MB)
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: No file uploaded or invalid file type
 *       401:
 *         description: Unauthorized
 *       413:
 *         description: File too large
 */
router.post('/image', upload.single('file'), uploadImage);

/**
 * @swagger
 * /api/upload/{filename}:
 *   delete:
 *     summary: Delete an uploaded file
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The filename to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       400:
 *         description: Invalid filename
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - You can only delete your own uploads
 *       404:
 *         description: File not found
 */
router.delete('/:filename', deleteFile);

export default router;
