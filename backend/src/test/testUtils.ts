import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { sign, SignOptions } from 'jsonwebtoken';
import { jest, expect } from '@jest/globals';

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        /** Field name specified in the form */
        fieldname: string;
        /** Name of the file on the user's computer */
        originalname: string;
        /** Encoding type of the file */
        encoding: string;
        /** Mime type of the file */
        mimetype: string;
        /** Size of the file in bytes */
        size: number;
        /** The folder to which the file has been saved (DiskStorage) */
        destination?: string;
        /** The name of the file within the destination (DiskStorage) */
        filename?: string;
        /** Location of the uploaded file (DiskStorage) */
        path?: string;
        /** A Buffer of the entire file (MemoryStorage) */
        buffer?: Buffer;
      }
    }
  }
}

interface MockRequestOptions {
  body?: any;
  params?: Record<string, string>;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  user?: any;
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

// Simple mock function type
type MockFunction = (...args: any[]) => any;

type MockResponse = Partial<Response> & {
  status: MockFunction;
  json: MockFunction;
  send: MockFunction;
  cookie: MockFunction;
  clearCookie: MockFunction;
  statusCode?: number;
  body?: any;
};

/**
 * Mocks the Express request object
 */
export const mockRequest = (options: MockRequestOptions = {}): Partial<Request> => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    ...options,
  } as Partial<Request>;
};

/**
 * Mocks the Express response object
 */
export const mockResponse = (): MockResponse => {
  const res: any = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis();
  res.cookie = jest.fn().mockReturnThis();
  res.clearCookie = jest.fn().mockReturnThis();
  return res as MockResponse;
};

/**
 * Mocks the Express next function
 */
export const mockNext = (): jest.Mock<NextFunction> => {
  return jest.fn() as jest.Mock<NextFunction>;
};

/**
 * Generates a JWT token for testing
 */
export const generateTestJwt = (userId: string, expiresIn = '1h'): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return sign({ id: userId }, process.env.JWT_SECRET, { expiresIn } as SignOptions);
};

/**
 * Generates a test user object
 */
export const generateTestUser = (overrides: Record<string, any> = {}) => ({
  _id: new Types.ObjectId(),
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'user',
  ...overrides,
});

/**
 * Waits for a specified number of milliseconds
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Expects an async function to throw an error
 */
export const expectAsyncError = async (
  fn: () => Promise<any>,
  errorMessage?: string
): Promise<void> => {
  try {
    await fn();
    // If the function doesn't throw, fail the test
    throw new Error('Expected function to throw');
  } catch (err: any) {
    if (errorMessage && err instanceof Error) {
      expect(err.message).toContain(errorMessage);
    }
  }
};
