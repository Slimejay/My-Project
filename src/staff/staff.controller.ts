import { Request, Response } from 'express';
import { staffService, authService } from './staff.service';
import { IStaffProps, IStaff } from './staff.model';

interface StaffRequest extends Request {
    staff?: IStaff;
  }
// Staff Controllers
export const staffController = {
  // Create staff member
  async createStaff(req: Request, res: Response): Promise<void> {
    try {
      const staffData: IStaffProps = req.body;
      const newStaff = await staffService.createStaff(staffData);
      
      res.status(201).json({
        success: true,
        data: newStaff
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create staff member'
      });
    }
  },

  // Get all staff members
  async getAllStaff(req: Request, res: Response): Promise<void> {
    try {
      const filter = req.query.filter ? JSON.parse(String(req.query.filter)) : {};
      const staff = await staffService.getAllStaff(filter);
      
      res.status(200).json({
        success: true,
        count: staff.length,
        data: staff
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to retrieve staff members'
      });
    }
  },

  // Get staff member by ID
  async getStaffById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const staff = await staffService.getStaffById(id);
      
      if (!staff) {
        res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: staff
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to retrieve staff member'
      });
    }
  },


  // Get  staff



  // Update staff member
  async updateStaff(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: Partial<IStaffProps> = req.body;
      
      const updatedStaff = await staffService.updateStaff(id, updateData);
      
      if (!updatedStaff) {
        res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: updatedStaff
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update staff member'
      });
    }
  },

  // Delete staff member
  async deleteStaff(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deletedStaff = await staffService.deleteStaff(id);
      
      if (!deletedStaff) {
        res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Staff member deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete staff member'
      });
    }
  }
};

// Auth Controllers
export const authController = {
  // Request login token (sent via email)
  async requestLoginToken(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required'
        });
        return;
      }
      
      await authService.sendLoginToken(email);
      
      // Always return success even if email doesn't exist (for security)
      res.status(200).json({
        success: true,
        message: 'If your email exists in our system, you will receive a login link shortly'
      });
    } catch (error: any) {
      console.error('Login token request error:', error);
      // For security, don't reveal specific error
      res.status(200).json({
        success: true,
        message: 'If your email exists in our system, you will receive a login link shortly'
      });
    }
  },

  // Verify login token and issue JWT
  async verifyLoginToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      
      if (!token || typeof token !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Token is required'
        });
        return;
      }
      
      const result = await authService.verifyLoginToken(token);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
            token: result.token,
            refresh_token: result.refresh_token,
          staff: {
            id: result.staff._id,
            firstname: result.staff.firstname,
            lastname: result.staff.lastname,
            email: result.staff.email,
            role: result.staff.role,
            team: result.staff.team
          }
        }
      });
    } catch (error: any) {
        console.log(error);
        
      res.status(401).json({
        success: false,
        message: error.message || 'Invalid or expired token'
      });
    }
  },

  // Get current user (from JWT)
  async getCurrentUser(req: StaffRequest, res: Response): Promise<void> {
    try {
      // User is attached to req by the auth middleware
      const user = req.staff;
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
        return;
      }
      
      const staff = await staffService.getStaffById(user.id);
      
      if (!staff) {
        res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: {
          id: staff._id,
          firstname: staff.firstname,
          lastname: staff.lastname,
          email: staff.email,
          role: staff.role,
          team: staff.team
        }
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Authentication failed'
      });
    }
  }
};