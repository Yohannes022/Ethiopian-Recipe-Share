import { IUser } from '@/types/user.types';

declare global {
  namespace Express {
    interface Request {
      user?: IUser & {
        _id: string;
        role: string;
      };
    }
  }
}

export {};
