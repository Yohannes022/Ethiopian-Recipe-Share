import mongoose, { Document } from 'mongoose';
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
declare const Profile: mongoose.Model<IProfile, {}, {}, {}, mongoose.Document<unknown, {}, IProfile, {}> & IProfile & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Profile;
