import { Request } from 'express';
import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      requestTime?: string;
      // Add other custom properties here
    }
  }
}

export interface AuthRequest extends Request {
  user: IUser;
}

export interface PaginationRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    sort?: string;
    fields?: string;
    [key: string]: string | undefined;
  };
}
