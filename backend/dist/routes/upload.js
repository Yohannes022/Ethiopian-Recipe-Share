"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const upload_controller_1 = require("../middleware/upload.controller");
const upload_controller_2 = require("../controllers/upload.controller");
const apiError_1 = require("../utils/apiError");
const router = (0, express_1.Router)();
// Upload single file
router.post('/upload', auth_1.protect, (0, upload_controller_1.uploadSingle)('file'), upload_controller_1.validateUpload, async (req, res, next) => {
    try {
        if (!req.file) {
            throw new apiError_1.BadRequestError('No file uploaded');
        }
        res.status(200).json({
            status: 'success',
            data: {
                file: req.file,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// Upload multiple files
router.post('/upload/multiple', auth_1.protect, (0, upload_controller_1.uploadMultiple)('files', 5), upload_controller_1.validateUpload, async (req, res, next) => {
    try {
        if (!req.files) {
            throw new apiError_1.BadRequestError('No files uploaded');
        }
        res.status(200).json({
            status: 'success',
            data: {
                files: req.files,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// Delete uploaded file
router.delete('/upload/:filename', auth_1.protect, async (req, res, next) => {
    try {
        const { filename } = req.params;
        await (0, upload_controller_2.deleteFile)(filename);
        res.status(200).json({
            status: 'success',
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
