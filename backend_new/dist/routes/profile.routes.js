"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profileController = __importStar(require("@/controllers/profile.controller"));
const auth_middleware_1 = require("@/middlewares/auth.middleware");
const profile_validator_1 = require("@/validators/profile.validator");
const upload_middleware_1 = require("@/middlewares/upload.middleware");
const express_validator_1 = require("express-validator");
const validate_request_middleware_1 = require("@/middlewares/validate-request.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
router.get('/me', profileController.getMyProfile);
router.patch('/me', profile_validator_1.updateProfileValidator, profileController.updateProfile);
router.post('/me/picture', auth_middleware_1.protect, upload_middleware_1.upload.single('profilePicture'), upload_middleware_1.handleMulterErrors, profileController.uploadProfilePicture);
router.get('/:userId/picture', [
    (0, express_validator_1.param)('userId').isMongoId().withMessage('Invalid user ID format'),
    validate_request_middleware_1.validate
], profileController.getProfilePicture);
router.delete('/me/picture', auth_middleware_1.protect, profileController.deleteProfilePicture);
router.get('/', profileController.getAllProfiles);
router.get('/:userId', [
    (0, express_validator_1.param)('userId').isMongoId().withMessage('Invalid user ID format'),
    validate_request_middleware_1.validate
], profileController.getUserProfile);
exports.default = router;
//# sourceMappingURL=profile.routes.js.map