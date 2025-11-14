// shared/authMiddleware.js
import jwt from 'jsonwebtoken';

export function authenticate(req) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Authentication error:', error.message);
    return null;
  }
}

export function requireAuth(handler) {
  return async (event, context) => {
    const user = authenticate(event);
    
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Authentication required' })
      };
    }
    
    event.user = user;
    return handler(event, context);
  };
}

export function requireAdmin(handler) {
  return async (event, context) => {
    const user = authenticate(event);
    
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Authentication required' })
      };
    }
    
    if (user.role !== 'admin') {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Admin access required' })
      };
    }
    
    event.user = user;
    return handler(event, context);
  };
}