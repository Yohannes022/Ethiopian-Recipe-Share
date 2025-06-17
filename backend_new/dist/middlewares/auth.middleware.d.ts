import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { IUser } from '@/models/user.model';
declare global {
    namespace Express {
        interface Request {
            user?: IUser & {
                _id: Types.ObjectId;
            };
        }
    }
}
export declare const protect: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const restrictTo: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
