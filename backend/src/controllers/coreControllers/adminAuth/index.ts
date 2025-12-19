import createAuthMiddleware from '@/controllers/middlewaresControllers/createAuthMiddleware';

const adminAuth = createAuthMiddleware('Admin');

export default adminAuth;

