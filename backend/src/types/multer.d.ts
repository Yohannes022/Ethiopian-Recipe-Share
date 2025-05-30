import { Request, Response, NextFunction } from 'express';
import { ParsedQs } from 'qs';

// Extend Express types
declare global {
  namespace Express {
    interface Request {
      file?: Multer.File;
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
    }
  }
}

// Multer types
declare module 'multer' {
  export interface MulterError extends Error {
    code: string;
    field: string;
    storageErrors?: any;
  }

  export interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
  }

  export interface Options {
    dest?: string;
    storage?: StorageEngine;
    fileFilter?: (
      req: Express.Request,
      file: File,
      callback: (error: Error | null, acceptFile: boolean) => void
    ) => void;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
  }

  export interface StorageEngine {
    _handleFile(
      req: Express.Request,
      file: File,
      callback: (error: Error | null, info: any) => void
    ): void;
    _removeFile(
      req: Express.Request,
      file: File,
      callback: (error: Error | null) => void
    ): void;
  }

  export interface DiskStorageOptions {
    destination?: string | ((req: Express.Request, file: File, callback: (error: Error | null, destination: string) => void) => void);
    filename?: (
      req: Express.Request,
      file: File,
      callback: (error: Error | null, filename: string) => void
    ) => void;
  }

  export interface MemoryStorageOptions {
    // No options for memory storage
  }

  export interface DiskStorage extends StorageEngine {
    constructor(options: DiskStorageOptions);
  }

  export interface MemoryStorage extends StorageEngine {
    constructor(options: MemoryStorageOptions);
  }

  export interface Multer {
    single(fieldname: string): (req: Express.Request, res: Response, next: NextFunction) => void;
    array(fieldname: string, maxCount?: number): (req: Express.Request, res: Response, next: NextFunction) => void;
    fields(fields: Array<{ name: string; maxCount: number }>): (req: Express.Request, res: Response, next: NextFunction) => void;
    none(): (req: Express.Request, res: Response, next: NextFunction) => void;
    any(): (req: Express.Request, res: Response, next: NextFunction) => void;
  }

  export const diskStorage: (options: DiskStorageOptions) => DiskStorage;
  export const memoryStorage: (options: MemoryStorageOptions) => MemoryStorage;
  export const multer: (options?: Options) => Multer;
}
