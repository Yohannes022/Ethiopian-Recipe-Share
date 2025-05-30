import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '@/types/user.types';

// Sign JWT token
const signToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Sign refresh token
const signRefreshToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

// Create and send token, create cookie and send response
export const createAndSendToken = (
  user: IUser,
  statusCode: number,
  res: Response
): void => {
  const token = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // Remove password from output
  user.password = undefined as any;

  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    sameSite: 'lax' as const, // Protection against CSRF attacks
  };

  // Set cookie
  res.cookie('jwt', token, cookieOptions);
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    httpOnly: true,
    path: '/api/v1/auth/refresh-token',
  });

  // Send response with user data and tokens
  res.status(statusCode).json({
    status: 'success',
    token,
    refreshToken,
    data: {
      user,
    },
  });
};

// Verify JWT token
export const verifyToken = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
};

// Verify refresh token
export const verifyRefreshToken = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_REFRESH_SECRET as string, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
};

// Get token from header or cookie
export const getTokenFromRequest = (req: any): string | null => {
  let token;
  
  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Get token from cookie
  else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  
  return token || null;
};

// Get refresh token from header or cookie
export const getRefreshTokenFromRequest = (req: any): string | null => {
  let refreshToken;
  
  // Get refresh token from header
  if (req.headers['x-refresh-token']) {
    refreshToken = req.headers['x-refresh-token'];
  } 
  // Get refresh token from cookie
  else if (req.cookies.refreshToken) {
    refreshToken = req.cookies.refreshToken;
  }
  
  return refreshToken || null;
};

// Generate token expiration date
export const generateTokenExpiration = (days: number = 30): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};
