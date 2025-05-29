import jwt from 'jsonwebtoken';
import { config } from '../config';
import { IUser } from '../interfaces/user.interface';

/**
 * Generate JWT token
 */
export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

/**
 * Verify JWT token
 */
export const verifyToken = (
  token: string
): { id: string; iat: number; exp: number } => {
  return jwt.verify(token, config.jwt.secret) as {
    id: string;
    iat: number;
    exp: number;
  };
};

/**
 * Generate tokens
 */
export const generateAuthTokens = (user: IUser) => {
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return {
    access: {
      token: accessToken,
      expires: new Date(
        Date.now() + parseInt(config.jwt.expiresIn) * 1000
      ).toISOString(),
    },
    refresh: {
      token: refreshToken,
      expires: new Date(
        Date.now() + parseInt(config.jwt.refreshExpiresIn) * 1000
      ).toISOString(),
    },
  };
};

/**
 * Generate token for password reset
 */
export const generatePasswordResetToken = (): string => {
  return jwt.sign({}, config.jwt.secret, {
    expiresIn: '10m', // 10 minutes
  });
};

/**
 * Generate token for email verification
 */
export const generateEmailVerificationToken = (): string => {
  return jwt.sign({}, config.jwt.secret, {
    expiresIn: '24h', // 24 hours
  });
};
