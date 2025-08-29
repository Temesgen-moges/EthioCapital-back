import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  // Log request context for debugging
  const logContext = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  };
  console.log('=== Auth Middleware Start ===', logContext);

  // Check if JWT_SECRET is configured
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not configured', logContext);
    return res.status(500).json({ message: 'Server configuration error: JWT_SECRET is missing' });
  }

  // Get Authorization header
  const authHeader = req.header('Authorization');
  console.log('Authorization header:', authHeader ? 'Present' : 'Missing', logContext);

  // Validate Authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('No token provided or invalid format', logContext);
    return res.status(401).json({ message: 'Authentication required: No token provided or invalid format' });
  }

  // Extract token
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    console.error('Token is empty', logContext);
    return res.status(401).json({ message: 'Authentication required: Token is missing' });
  }

  // Log truncated token for debugging
  console.log('Token (truncated):', `${token.slice(0, 10)}... (length: ${token.length})`, logContext);

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token payload:', JSON.stringify(decoded, null, 2), logContext);

    // Validate decoded token structure
    const userId = decoded.userId || decoded.id;
    if (!userId) {
      console.error('Decoded token missing userId or id:', decoded, logContext);
      return res.status(401).json({ message: 'Invalid token: Missing userId' });
    }

    // Standardize req.user
    req.user = {
      userId: userId,
      fullName: typeof decoded.fullName === 'string' ? decoded.fullName.trim() : decoded.email || 'Unknown User',
      email: typeof decoded.email === 'string' ? decoded.email.trim() : '',
      role: decoded.role || 'entrepreneur', // Default role if not provided
    };

    console.log('Authenticated user:', JSON.stringify(req.user, null, 2), logContext);
    next();
  } catch (error) {
    console.error('Token verification error:', error.message, logContext);
    let errorMessage = 'Invalid or malformed token';
    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Token has expired';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token';
    }
    return res.status(401).json({ message: `Authentication failed: ${errorMessage}` });
  }
};