import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService, UserWithoutSensitiveData } from '../user/user.service';
import { RequestOtpDto, VerifyOtpDto } from './auth.dto';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async requestOtp(requestOtpDto: RequestOtpDto): Promise<{ success: boolean }> {
    const { phoneNumber } = requestOtpDto;
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 10); // OTP expires in 10 minutes

    // In a real app, you would send this OTP via SMS
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    // Save OTP to user
    await this.userService.updateOtp(phoneNumber, otp, otpExpires);
    
    return { success: true };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ 
    accessToken: string; 
    user: UserWithoutSensitiveData 
  } | null> {
    const { phoneNumber, otp } = verifyOtpDto;
    
    // Verify OTP
    const isValid = await this.userService.verifyOtp(phoneNumber, otp);
    
    if (!isValid) {
      return null;
    }

    // Get or create user
    let user = await this.userService.findByPhone(phoneNumber);
    if (!user) {
      user = await this.userService.createUser(phoneNumber);
    }

    // Generate JWT token
    const payload = { phoneNumber: user.phoneNumber, sub: user._id };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.userService.sanitizeUser(user),
    };
  }

  async validateUser(phoneNumber: string): Promise<any> {
    return this.userService.findByPhone(phoneNumber);
  }
}
