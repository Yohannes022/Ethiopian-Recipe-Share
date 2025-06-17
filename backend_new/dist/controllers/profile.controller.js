"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProfiles = exports.deleteProfilePicture = exports.getProfilePicture = exports.uploadProfilePicture = exports.updateProfile = exports.getUserProfile = exports.getMyProfile = void 0;
const profile_model_1 = __importDefault(require("@/models/profile.model"));
const appError_1 = __importDefault(require("@/utils/appError"));
const getMyProfile = async (req, res, next) => {
    try {
        const profile = await profile_model_1.default.findOne({ user: req.user?._id }).populate('user', 'name email photo');
        if (!profile) {
            return next(new appError_1.default('Profile not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                profile,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyProfile = getMyProfile;
const getUserProfile = async (req, res, next) => {
    try {
        const profile = await profile_model_1.default.findOne({ user: req.params.userId }).populate('user', 'name email photo');
        if (!profile) {
            return next(new appError_1.default('Profile not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                profile,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserProfile = getUserProfile;
const updateProfile = async (req, res, next) => {
    try {
        const { bio, location, website, social } = req.body;
        const profile = await profile_model_1.default.findOneAndUpdate({ user: req.user?._id }, { bio, location, website, social }, { new: true, runValidators: true }).populate('user', 'name email photo');
        if (!profile) {
            return next(new appError_1.default('Profile not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                profile,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
const uploadProfilePicture = async (req, res, next) => {
    try {
        console.log('Uploading profile picture for user:', req.user?._id);
        if (!req.file) {
            console.error('No file was uploaded');
            return next(new appError_1.default('Please upload an image file', 400));
        }
        console.log('File uploaded successfully:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
        if (req.file.size > 5 * 1024 * 1024) {
            console.error('File too large:', req.file.size);
            return next(new appError_1.default('File too large. Maximum size is 5MB.', 400));
        }
        const updateData = {
            profilePicture: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            },
            updatedAt: new Date()
        };
        console.log('Updating profile with data:', {
            userId: req.user?._id,
            hasImageData: !!req.file.buffer,
            contentType: req.file.mimetype
        });
        const profile = await profile_model_1.default.findOneAndUpdate({ user: req.user?._id }, updateData, {
            new: true,
            runValidators: true,
            upsert: false
        });
        if (!profile) {
            console.error('Profile not found for user:', req.user?._id);
            return next(new appError_1.default('Profile not found', 404));
        }
        const profileObj = profile.toObject();
        if (profileObj.profilePicture && 'data' in profileObj.profilePicture) {
            const { data, ...profilePictureWithoutData } = profileObj.profilePicture;
            profileObj.profilePicture = profilePictureWithoutData;
        }
        console.log('Profile picture updated successfully for user:', req.user?._id);
        res.status(200).json({
            status: 'success',
            data: {
                profile: profileObj
            }
        });
    }
    catch (error) {
        console.error('Error in uploadProfilePicture:', error);
        next(error);
    }
};
exports.uploadProfilePicture = uploadProfilePicture;
const getProfilePicture = async (req, res, next) => {
    try {
        const profile = await profile_model_1.default.findById(req.params.userId)
            .select('profilePicture');
        if (!profile?.profilePicture?.data) {
            return next(new appError_1.default('No profile picture found', 404));
        }
        res.set('Content-Type', profile.profilePicture.contentType);
        res.set('Cache-Control', 'public, max-age=86400');
        res.send(profile.profilePicture.data);
    }
    catch (error) {
        next(error);
    }
};
exports.getProfilePicture = getProfilePicture;
const deleteProfilePicture = async (req, res, next) => {
    try {
        const profile = await profile_model_1.default.findOneAndUpdate({ user: req.user?._id }, { $unset: { profilePicture: 1 } }, { new: true });
        if (!profile) {
            return next(new appError_1.default('Profile not found', 404));
        }
        res.status(200).json({
            status: 'success',
            message: 'Profile picture deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProfilePicture = deleteProfilePicture;
const getAllProfiles = async (req, res, next) => {
    try {
        const filter = {};
        const profiles = await profile_model_1.default.find(filter).populate('user', 'name email photo');
        res.status(200).json({
            status: 'success',
            results: profiles.length,
            data: {
                profiles,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllProfiles = getAllProfiles;
//# sourceMappingURL=profile.controller.js.map