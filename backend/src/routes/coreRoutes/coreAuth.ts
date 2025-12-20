import express, { Router } from 'express';
import { catchErrors } from '@/handlers/errorHandlers';
import adminAuth from '@/controllers/coreControllers/adminAuth';

const router: Router = express.Router();

router.route('/login').post(catchErrors(adminAuth.login));

router.route('/forgetpassword').post(catchErrors(adminAuth.forgetPassword));
router.route('/resetpassword').post(catchErrors(adminAuth.resetPassword));

router.route('/logout').post(adminAuth.isValidAuthToken, catchErrors(adminAuth.logout));

router.route('/signup').post(catchErrors(adminAuth.signUp));

export default router;


