import { Request } from 'express';
import { IAuthUser } from './common';

export interface IAuthRequest extends Request {
  user?: IAuthUser;
}

export interface IQueryRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    sort?: string;
    fields?: string;
  };
}

export interface IUploadRequest extends Request {
  files?: Express.Multer.File[];
  body: {
    [key: string]: any;
  };
}
