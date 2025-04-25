import jwt from 'jsonwebtoken';

// Cache JWT_SECRET to avoid repeated lookups
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  // Log request context for debugging
  const logContext = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  };

  // console.log('=== Auth Middleware Start ===', logContext);

  // Check if JWT_SECRET is configured
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not configured', logContext);
    return res.status(500).json({ message: 'Server configuration error' });
  }

  // Get Authorization header
  const authHeader = req.headers.authorization;
  // console.log('Authorization header:', authHeader ? 'Present' : 'Missing', logContext);

  // Validate Authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('No token provided or invalid format', logContext);
    return res.status(401).json({ message: 'Authentication required: No token provided or invalid format' });
  }

  // Extract token
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.error('Token is empty', logContext);
    return res.status(401).json({ message: 'Authentication required: Token is missing' });
  }

  // Log truncated token for debugging (first 10 chars + length)
  // console.log('Token (truncated):', `${token.slice(0, 10)}... (length: ${token.length})`, logContext);

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log('Decoded token payload:', JSON.stringify(decoded, null, 2), logContext);

    // Validate decoded token structure
    if (!decoded.userId) {
      console.error('Decoded token missing userId:', decoded, logContext);
      return res.status(401).json({ message: 'Invalid token: Missing userId' });
    }

    // Validate role
    const allowedRoles = ['investor', 'entrepreneur', 'admin'];
    if (!decoded.role || !allowedRoles.includes(decoded.role)) {
      console.error('Invalid or missing role in token:', decoded.role, logContext);
      return res.status(403).json({ message: 'Invalid token: Missing or invalid role' });
    }

    // Sanitize and set req.user
    req.user = {
      _id: decoded.userId,
      fullName: typeof decoded.fullName === 'string' ? decoded.fullName.trim() : decoded.email || 'Unknown User',
      email: typeof decoded.email === 'string' ? decoded.email.trim() : '',
      role: decoded.role,
    };

    // console.log('Authenticated user:', JSON.stringify(req.user, null, 2), logContext);
    next();
  } catch (error) {
    console.error('Token verification error:', error.message, logContext);
    const errorMessage =
      error.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid or malformed token';
    return res.status(401).json({ message: `Authentication failed: ${errorMessage}` });
  }
};

export default authMiddleware;// import jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET;

// const authMiddleware = (req, res, next) => {
//   const logContext = {
//     method: req.method,
//     url: req.originalUrl,
//     ip: req.ip,
//     timestamp: new Date().toISOString(),
//   };

//   console.log('=== Auth Middleware Start ===', logContext);

//   if (!JWT_SECRET) {
//     console.error('JWT_SECRET is not configured', logContext);
//     return res.status(500).json({ message: 'Server configuration error' });
//   }

//   const authHeader = req.headers.authorization;
//   console.log('Authorization header:', authHeader ? 'Present' : 'Missing', logContext);

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     console.error('No token provided or invalid format', logContext);
//     return res.status(401).json({ message: 'Authentication required: No token provided or invalid format' });
//   }

//   const token = authHeader.split(' ')[1];
//   if (!token) {
//     console.error('Token is empty', logContext);
//     return res.status(401).json({ message: 'Authentication required: Token is missing' });
//   }

//   console.log('Token (truncated):', `${token.slice(0, 10)}... (length: ${token.length})`, logContext);

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     console.log('Decoded token payload:', JSON.stringify(decoded, null, 2), logContext);

//     // Validate decoded token structure
//     const userId = decoded._id || decoded.userId; // Accept either _id or userId
//     if (!userId) {
//       console.error('Decoded token missing _id or userId:', decoded, logContext);
//       return res.status(401).json({ message: 'Invalid token: Missing _id or userId' });
//     }

//     // Validate role
//     const allowedRoles = ['investor', 'entrepreneur', 'admin'];
//     if (!decoded.role || !allowedRoles.includes(decoded.role)) {
//       console.error('Invalid or missing role in token:', decoded.role, logContext);
//       return res.status(403).json({ message: 'Invalid token: Missing or invalid role' });
//     }

//     // Sanitize and set req.user
//     req.user = {
//       _id: userId, // Use the resolved userId
//       fullName: typeof decoded.fullName === 'string' ? decoded.fullName.trim() : decoded.email || 'Unknown User',
//       email: typeof decoded.email === 'string' ? decoded.email.trim() : '',
//       role: decoded.role,
//     };

//     console.log('Authenticated user:', JSON.stringify(req.user, null, 2), logContext);
//     next();
//   } catch (error) {
//     console.error('Token verification error:', error.message, logContext);
//     const errorMessage =
//       error.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid or malformed token';
//     return res.status(401).json({ message: `Authentication failed: ${errorMessage}` });
//   }
// };

// export default authMiddleware;