import express from 'express';
import { staffController, authController } from './staff.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

// Create routers
const router = express.Router();

// Staff routes
router.post('/createStaff', authenticate, authorize(['admin']), staffController.createStaff);
router.get('/getAllStaff', authenticate, authorize(['admin']),staffController.getAllStaff);
router.get('/getStaffById/:id', authenticate, authorize(['admin']),staffController.getStaffById);
router.put('/updateStaff/:id', authenticate, authorize(['admin']), staffController.updateStaff);
router.delete('/deleteStaff/:id', authenticate, authorize(['admin']), staffController.deleteStaff);

// Auth routes
router.post('/requestlogin', authController.requestLoginToken);
router.post('/login', authController.verifyLoginToken);
router.get('/getCurrentUser', authenticate, authController.getCurrentUser);

export default router;