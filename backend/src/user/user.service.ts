import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

export type UserWithoutSensitiveData = Omit<User, 'otp' | 'otpExpires'>;

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findByPhone(phoneNumber: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phoneNumber }).exec();
  }

  async createUser(phoneNumber: string): Promise<UserDocument> {
    const user = new this.userModel({ phoneNumber });
    return user.save();
  }

  async updateOtp(phoneNumber: string, otp: string, otpExpires: Date): Promise<UserDocument | null> {
    return this.userModel
      .findOneAndUpdate(
        { phoneNumber },
        { otp, otpExpires },
        { new: true, upsert: true },
      )
      .exec();
  }

  async verifyOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const user = await this.userModel.findOne({
      phoneNumber,
      otp,
      otpExpires: { $gt: new Date() },
    });

    if (!user) return false;

    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();
    return true;
  }

  async updateProfile(phoneNumber: string, updateData: { name?: string }): Promise<UserDocument | null> {
    return this.userModel
      .findOneAndUpdate(
        { phoneNumber },
        { $set: updateData },
        { new: true },
      )
      .select('-otp -otpExpires')
      .exec();
  }

  sanitizeUser(user: UserDocument): UserWithoutSensitiveData {
    const { otp, otpExpires, ...userData } = user.toObject();
    return userData;
  }
}
