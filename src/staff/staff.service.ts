import { Staff, Token, IStaff, IStaffProps } from './staff.model';
import mongoose from 'mongoose';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/email';
import dotenv from "dotenv"
dotenv.config()

// Cast JWT_SECRET to Buffer to satisfy TypeScript
const JWT_SECRET = process.env.JWT_SECRET 
const REFRESH_SECRET = process.env.REFRESH_SECRET 

class StaffService {
  // Create new staff member
  async createStaff(staffData: IStaffProps): Promise<IStaff> {
    try {
      const newStaff = await Staff.create(staffData);
      return newStaff;
    } catch (error) {
      throw error;
    }
  }

  // Get all staff members
  async getAllStaff(filter = {}, select = ''): Promise<IStaff[]> {
    try {
      return await Staff.find(filter).select(select);
    } catch (error) {
      throw error;
    }
  }

  // Get staff by ID
  async getStaffById(id: string | unknown): Promise<IStaff | null> {
    try {
      if (!id) {
        throw new Error('Invalid staff ID');
      }
      return await Staff.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Get staff by email
  async getStaffByEmail(email: string): Promise<IStaff | null> {
    try {
      return await Staff.findOne({ email });
    } catch (error) {
      throw error;
    }
  }

  // Update staff
  async updateStaff(id: string, updateData: Partial<IStaffProps>): Promise<IStaff | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid staff ID');
      }
      
      // If updating password, the controller should handle hashing
      return await Staff.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw error;
    }
  }

  // Delete staff
  async deleteStaff(id: string): Promise<IStaff | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid staff ID');
      }
      return await Staff.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }
}

class AuthService {
  // Generate authentication token
  async generateToken(staffId: string | unknown, purpose: 'auth' | 'reset'): Promise<string> {
    try {
      // Generate random token
      const generatedToken = crypto.randomBytes(3).toString('hex');
      
      // Calculate expiration (24 hours)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      // Save token to database
      await Token.create({
        staff: staffId,
        token: generatedToken,
        purpose,
        expiresAt,
        isUsed: false
      });
      
      return generatedToken;
    } catch (error) {
      throw error;
    }
  }

  // Verify token
  async verifyToken(token: string, purpose: 'auth' | 'reset'): Promise<any> {
    try {

      
      const tokenDoc = await Token.findOne({
        token: token,
        purpose
      })

      
      
      if (!tokenDoc) {
        throw new Error('Invalid or expired token');
      }
      
      return tokenDoc;
    } catch (error) {
      throw error;
    }
  }

  // Mark token as used
  async useToken(tokenId: string): Promise<void> {
    try {
      
      await Token.findByIdAndUpdate(tokenId, { isUsed: true });
    } catch (error) {
      throw error;
    }
  }

  // Send login token via email
  async sendLoginToken(email: string): Promise<boolean> {
    try {
      // Find staff by email
      const staff = await Staff.findOne({ email });
      
      if (!staff) {
        throw new Error('Staff not found');
      }
      
      // Generate token
      const token = await this.generateToken(staff._id, 'auth');
      
      // Construct login URL with token
      
      // Send email
      await sendEmail({
        to: staff.email,
        subject: 'Login Token',
        html: `
          <p>Hello ${staff.firstname},</p>
          <p>Please use the token below to login:</p>
          ${token}
          <p>This token is valid for 24 hours.</p>
        `
      });
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Verify login and generate JWT
  async verifyLoginToken(token: string): Promise<{ staff: IStaff, token: string, refresh_token: string }> {
    try {
      // Verify token
      const tokenDoc = await this.verifyToken(token, 'auth');
      
      // Mark token as used
      await this.useToken(tokenDoc._id);
      
      // Update last login time
      const staff = await Staff.findByIdAndUpdate(tokenDoc.staff._id, { 
        lastLogin: new Date() 
      }, {
        new: true,
        runValidators: true
      });
      
      // Create a plain object for JWT payload
      const payload = {
        _id: staff._id.toString(),
        role: staff.role,
        email: staff.email,
        team: staff.team,
        firstname: staff.firstname,
        lastname: staff.lastname
      };
      
      // Generate JWT for authenticated sessions
      const jwtToken = jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: "168h" }
      );
  
      const refreshToken = jwt.sign(
        payload,
        REFRESH_SECRET,
        { expiresIn: "672h" }
      );
      
      return {
        token: jwtToken,
        refresh_token: refreshToken,
        staff: tokenDoc.staff,
      };
    } catch (error) {
      throw error;
    }
  }

  // Validate JWT token
  verifyJwt(token: string): any {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw error;
    }
  }
}

export const staffService = new StaffService();
export const authService = new AuthService();