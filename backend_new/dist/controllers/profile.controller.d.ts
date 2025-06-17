import { Request, Response, NextFunction } from 'express';
export declare const getMyProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const uploadProfilePicture: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getProfilePicture: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteProfilePicture: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllProfiles: (req: Request, res: Response, next: NextFunction) => Promise<void>;
