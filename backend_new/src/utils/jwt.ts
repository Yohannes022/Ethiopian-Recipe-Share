import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { Response } from 'express';

interface TokenPayload {
  id: string;
  iat: number;
  exp: number;
}

const JWT_SECRET = process.env.JWT_SECRET as jwt.Secret || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '90d';

// Sign JWT token
export const signToken = (id: Types.ObjectId): string => {
  return jwt.sign(
    { id: id.toString() }, 
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );
};

// Create and send JWT token
export const createSendToken = (
  user: any,
  statusCode: number,
  res: Response
): void => {
  const token = signToken(user._id);
  
  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};
