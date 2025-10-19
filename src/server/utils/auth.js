import jwt from 'jsonwebtoken';
import { config } from '@server/config';

export function verifyAuthToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, error: 'No valid authorization header' };
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    return { success: true, user: decoded };
  } catch (error) {
    return { success: false, error: 'Invalid or expired token' };
  }
}

export function generateAuthToken(payload) {
  return jwt.sign(
    payload,
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRY }
  );
}