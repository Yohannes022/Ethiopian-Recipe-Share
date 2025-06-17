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
export declare const getAllMenuItems: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createMenuItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMenuItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateMenuItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteMenuItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMenuItemsByRestaurant: (req: Request, res: Response, next: NextFunction) => Promise<void>;
