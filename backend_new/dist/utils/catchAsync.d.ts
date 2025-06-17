import { NextFunction, Request, RequestHandler, Response } from 'express';
declare const catchAsync: (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => RequestHandler;
export default catchAsync;
