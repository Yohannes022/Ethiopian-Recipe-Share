import multer from 'multer';
import { Request } from 'express';
declare const upload: multer.Multer;
declare const handleMulterErrors: (err: any, req: Request, res: any, next: any) => any;
export { upload, handleMulterErrors };
