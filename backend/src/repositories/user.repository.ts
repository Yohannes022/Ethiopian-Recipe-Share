import { Model } from 'mongoose';
import { IUser, UserDocument } from '../models/User';
import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository<UserDocument> {
  constructor(private readonly userModel: Model<UserDocument>) {
    super(userModel);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
    const query: any = { email };
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }
    const count = await this.userModel.countDocuments(query);
    return count > 0;
  }

  async markEmailAsVerified(userId: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { emailVerified: true, emailVerificationToken: undefined },
        { new: true }
      )
      .exec();
  }

  async updatePassword(
    userId: string,
    newPassword: string
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { password: newPassword },
        { new: true, runValidators: true }
      )
      .select('-password')
      .exec();
  }

  async createPasswordResetToken(userId: string): Promise<{ resetToken: string; user: UserDocument }> {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          passwordResetToken,
          passwordResetExpires,
        },
        { new: true, runValidators: true }
      )
      .exec();

    if (!user) {
      throw new Error('User not found');
    }

    return { resetToken, user };
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<UserDocument | null> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userModel
      .findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      })
      .select('+password')
      .exec();

    if (!user) {
      throw new Error('Token is invalid or has expired');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return user;
  }

  async updateUserProfile(
    userId: string,
    updateData: Partial<IUser>
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      })
      .select('-password')
      .exec();
  }
}
