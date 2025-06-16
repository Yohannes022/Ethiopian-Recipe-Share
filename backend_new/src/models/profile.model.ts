import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

export interface IProfile extends Document {
  user: IUser['_id'];
  bio?: string;
  location?: string;
  website?: string;
  profilePicture?: {
    data: Buffer;
    contentType: string;
  };
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    location: {
      type: String,
      maxlength: 100,
    },
    website: {
      type: String,
      maxlength: 200,
    },
    profilePicture: {
      data: Buffer,
      contentType: String
    },
    social: {
      facebook: {
        type: String,
        maxlength: 200,
      },
      twitter: {
        type: String,
        maxlength: 200,
      },
      instagram: {
        type: String,
        maxlength: 200,
      },
      youtube: {
        type: String,
        maxlength: 200,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for profile picture URL
profileSchema.virtual('profilePictureUrl').get(function() {
  if (this.profilePicture?.data) {
    return `/api/v1/profiles/${this._id}/picture`;
  }
  return null;
});

// Ensure each user has only one profile
profileSchema.index({ user: 1 }, { unique: true });

const Profile = mongoose.model<IProfile>('Profile', profileSchema);
export default Profile;
