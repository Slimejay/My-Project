import { Request, Response, NextFunction } from 'express';
import { authService } from '../staff/staff.service';
import { IStaff } from '../staff/staff.model';

interface AuthRequest extends Request {
  staff?: IStaff;
}

/**
 * Middleware to authenticate requests using JWT
 * Extracts token from Authorization header and verifies it
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }
    
    // Verify token
    const decoded = authService.verifyJwt(token);
    
    // Attach user to request
    req.staff = decoded
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Middleware to restrict access based on role
 * @param roles Array of allowed roles
 */
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.staff) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }
    
    if (!roles.includes(req.staff.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }
    
    next();
  };
};