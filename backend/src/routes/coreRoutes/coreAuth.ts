import express, { Router } from 'express';
import { catchErrors } from '@/handlers/errorHandlers';
import adminAuth from '@/controllers/coreControllers/adminAuth';

const router: Router = express.Router();

// ============================================
// PUBLIC ROUTES - NO AUTHENTICATION REQUIRED
// These routes are used to OBTAIN authentication tokens
// ============================================

// Login route - NO auth token required (user logs in to GET token)
router.route('/login').post(catchErrors(adminAuth.login));

// Signup route - NO auth token required (new user registration)
router.route('/signup').post(catchErrors(adminAuth.signUp));

// Password reset routes - NO auth token required
router.route('/forgetpassword').post(catchErrors(adminAuth.forgetPassword));
router.route('/resetpassword').post(catchErrors(adminAuth.resetPassword));

// ============================================
// PROTECTED ROUTES - AUTHENTICATION REQUIRED
// ============================================

// Logout route - REQUIRES auth token (user must be logged in to logout)
router.route('/logout').post(adminAuth.isValidAuthToken, catchErrors(adminAuth.logout));

export default router;


