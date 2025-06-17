import { Types } from 'mongoose';
import { Response } from 'express';
export declare const signToken: (id: Types.ObjectId) => string;
export declare const createSendToken: (user: any, statusCode: number, res: Response) => void;
export declare const verifyToken: (token: string) => any;
