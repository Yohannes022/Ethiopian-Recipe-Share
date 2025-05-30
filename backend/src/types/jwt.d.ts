import { SignOptions } from 'jsonwebtoken';

// Type for JWT expiration time
export type JWTExpiration = string | number | undefined;

// Extend SignOptions to properly type expiresIn
export interface ExtendedSignOptions extends SignOptions {
  expiresIn?: JWTExpiration;
}
