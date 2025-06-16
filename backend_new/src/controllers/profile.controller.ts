import { Request, Response, NextFunction } from 'express';
import Profile, { IProfile } from '@/models/profile.model';
import AppError from '@/utils/appError';
import { FilterQuery } from 'mongoose';

// Get current user's profile
export const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await Profile.findOne({ user: req.user?._id }).populate('user', 'name email photo');

    if (!profile) {
      return next(new AppError('Profile not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile by ID
export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId }).populate('user', 'name email photo');

    if (!profile) {
      return next(new AppError('Profile not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update profile
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bio, location, website, social } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { user: req.user?._id },
      { bio, location, website, social },
      { new: true, runValidators: true }
    ).populate('user', 'name email photo');

    if (!profile) {
      return next(new AppError('Profile not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Upload profile picture
export const uploadProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Uploading profile picture for user:', req.user?._id);
    
    if (!req.file) {
      console.error('No file was uploaded');
      return next(new AppError('Please upload an image file', 400));
    }

    console.log('File uploaded successfully:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Validate file size (should be handled by multer, but double-checking)
    if (req.file.size > 5 * 1024 * 1024) { // 5MB
      console.error('File too large:', req.file.size);
      return next(new AppError('File too large. Maximum size is 5MB.', 400));
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

    const profile = await Profile.findOneAndUpdate(
      { user: req.user?._id },
      updateData,
      { 
        new: true, 
        runValidators: true,
        upsert: false // Don't create a new profile if it doesn't exist
      }
    );

    if (!profile) {
      console.error('Profile not found for user:', req.user?._id);
      return next(new AppError('Profile not found', 404));
    }

    // Remove the binary data from the response
    const profileObj = profile.toObject();
    if (profileObj.profilePicture) {
      delete profileObj.profilePicture.data;
    }

    console.log('Profile picture updated successfully for user:', req.user?._id);

    res.status(200).json({
      status: 'success',
      data: {
        profile: profileObj
      }
    });
  } catch (error) {
    console.error('Error in uploadProfilePicture:', error);
    next(error);
  }
};

// Get profile picture
export const getProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await Profile.findById(req.params.userId)
      .select('profilePicture');

    if (!profile?.profilePicture?.data) {
      return next(new AppError('No profile picture found', 404));
    }

    res.set('Content-Type', profile.profilePicture.contentType);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.send(profile.profilePicture.data);
  } catch (error) {
    next(error);
  }
};

// Delete profile picture
export const deleteProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.user?._id },
      { $unset: { profilePicture: 1 } },
      { new: true }
    );

    if (!profile) {
      return next(new AppError('Profile not found', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all profiles
export const getAllProfiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: FilterQuery<IProfile> = {};

    // Add any filtering logic here if needed
    // e.g., filter by location, etc.

    const profiles = await Profile.find(filter).populate('user', 'name email photo');

    res.status(200).json({
      status: 'success',
      results: profiles.length,
      data: {
        profiles,
      },
    });
  } catch (error) {
    next(error);
  }
};
