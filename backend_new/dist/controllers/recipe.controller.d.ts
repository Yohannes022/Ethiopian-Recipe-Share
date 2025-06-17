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
export declare const getAllRecipes: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getRecipe: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createRecipe: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateRecipe: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteRecipe: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const likeRecipe: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const addComment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const rateRecipe: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const searchRecipes: (req: Request, res: Response, next: NextFunction) => Promise<void>;
