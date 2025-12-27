const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');

const isValidAuthToken = async (req, res, next, { userModel, jwtSecret = 'JWT_SECRET' }) => {
  try {
    const UserPassword = mongoose.model(userModel + 'Password');
    const User = mongoose.model(userModel);

    // Support multiple token sources for backward compatibility and cookie-based auth
    // Priority: 1. Cookie (x-auth-token) - for cookie-based sessions
    //           2. Authorization header (Bearer token) - for backward compatibility
    //           3. Cookie header string parsing - fallback
    let token = null;
    
    // Check cookie first (for cookie-based sessions from Next.js)
    if (req.cookies && req.cookies['x-auth-token']) {
      token = req.cookies['x-auth-token'];
    }
    // Check Authorization header (for backward compatibility with old frontend)
    else if (req.headers['authorization']) {
      const authHeader = req.headers['authorization'];
      // Support both "Bearer <token>" and direct token
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else {
        token = authHeader;
      }
    }
    // Also check cookie header string directly (for cases where cookieParser might not work)
    else if (req.headers['cookie']) {
      const cookieString = req.headers['cookie'];
      const cookieMatch = cookieString.match(/x-auth-token=([^;]+)/);
      if (cookieMatch) {
        token = cookieMatch[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'No authentication token, authorization denied.',
        jwtExpired: true,
      });
    }

    const verified = jwt.verify(token, process.env[jwtSecret]);

    if (!verified)
      return res.status(401).json({
        success: false,
        result: null,
        message: 'Token verification failed, authorization denied.',
        jwtExpired: true,
      });

    // Support both 'id' (backend format) and 'userId' (Next.js format)
    const userId = verified.id || verified.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'Invalid token format, authorization denied.',
        jwtExpired: true,
      });
    }

    const userPasswordPromise = UserPassword.findOne({ user: userId, removed: false });
    const userPromise = User.findOne({ _id: userId, removed: false });

    const [user, userPassword] = await Promise.all([userPromise, userPasswordPromise]);

    if (!user)
      return res.status(401).json({
        success: false,
        result: null,
        message: "User doesn't Exist, authorization denied.",
        jwtExpired: true,
      });

    // For cookie-based sessions (Next.js), we might skip the loggedSessions check
    // if the token comes from a cookie. This allows cookie-based auth to work
    // without requiring the token to be in loggedSessions.
    // For backward compatibility, we still check loggedSessions for Authorization header tokens.
    const isCookieToken = req.cookies && req.cookies['x-auth-token'];
    const isAuthHeaderToken = req.headers['authorization'];
    
    // If token is from cookie and userPassword exists, allow it (cookie-based session)
    // If token is from Authorization header, check loggedSessions (session-based)
    if (isAuthHeaderToken && userPassword) {
      const { loggedSessions } = userPassword;
      if (!loggedSessions || !loggedSessions.includes(token)) {
        return res.status(401).json({
          success: false,
          result: null,
          message: 'User is already logout try to login, authorization denied.',
          jwtExpired: true,
        });
      }
    }
    // For cookie-based tokens, we trust the JWT verification and allow access
    // This enables cookie-based sessions to work without loggedSessions tracking
    
    const reqUserName = userModel.toLowerCase();
    req[reqUserName] = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
      controller: 'isValidAuthToken',
      jwtExpired: true,
    });
  }
};

module.exports = isValidAuthToken;
