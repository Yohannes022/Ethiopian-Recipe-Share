import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '@/types/user.types';
import { env } from '@/config/config';
import { SignOptions } from 'jsonwebtoken';

// Type assertion for JWT environment variables
const jwtConfig = {
  JWT_SECRET: env.JWT_SECRET,
  JWT_EXPIRES_IN: env.JWT_EXPIRES_IN as string,
  JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: env.JWT_REFRESH_EXPIRES_IN as string,
  JWT_COOKIE_EXPIRES_IN: env.JWT_COOKIE_EXPIRES_IN,
};

// Type for JWT expiration time
type JWTExpiration = string | number | undefined;

// Validate configuration
if (!jwtConfig.JWT_SECRET || !jwtConfig.JWT_EXPIRES_IN || !jwtConfig.JWT_REFRESH_SECRET || !jwtConfig.JWT_REFRESH_EXPIRES_IN || !jwtConfig.JWT_COOKIE_EXPIRES_IN) {
  throw new Error('JWT configuration is missing required environment variables');
}

// Sign JWT token
const signToken = (id: string): string => {
  if (!jwtConfig.JWT_SECRET || !jwtConfig.JWT_EXPIRES_IN) {
    throw new Error('JWT configuration is missing required environment variables');
  }
  const options = {
    expiresIn: jwtConfig.JWT_EXPIRES_IN,
  } as SignOptions;
  return jwt.sign({ id }, jwtConfig.JWT_SECRET, options);
};

// Sign refresh token
const signRefreshToken = (id: string): string => {
  if (!jwtConfig.JWT_REFRESH_SECRET || !jwtConfig.JWT_REFRESH_EXPIRES_IN) {
    throw new Error('JWT refresh token configuration is missing required environment variables');
  }
  const options = {
    expiresIn: jwtConfig.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions;
  return jwt.sign({ id }, jwtConfig.JWT_REFRESH_SECRET, options);
};

// Create and send token, create cookie and send response
export const createAndSendToken = (
  user: IUser,
  statusCode: number,
  res: Response
): void => {
  // Ensure user._id is converted to string if it's an ObjectId
  const userId = user._id.toString();
  const token = signToken(userId);
  const refreshToken = signRefreshToken(userId);

  // Remove password from output
  user.password = undefined as any;

  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + Number(env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: env.NODE_ENV === 'production', // Only send over HTTPS in production
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
    jwt.verify(token, jwtConfig.JWT_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
};

// Verify refresh token
export const verifyRefreshToken = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtConfig.JWT_REFRESH_SECRET, (err, decoded) => {
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
