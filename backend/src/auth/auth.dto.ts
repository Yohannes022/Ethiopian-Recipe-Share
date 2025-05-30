import { IsString, IsPhoneNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class RequestOtpDto {
  @IsPhoneNumber(null, { message: 'Invalid phone number format' })
  @IsNotEmpty()
  phoneNumber: string;
}

export class VerifyOtpDto {
  @IsPhoneNumber(null, { message: 'Invalid phone number format' })
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;
}
