import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        error: 'You do not have permission to perform this action'
      });
    }
    
    next();
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Error checking admin permissions'
    });
  }
};

export default isAdmin;
