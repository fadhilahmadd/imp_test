import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import { verifyToken } from '@/lib/auth';
import { ApiError } from '@/lib/api-error';

export type AuthVariables = {
  userId?: string;
};

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const token = getCookie(c, 'auth_token');
  if (!token) {
    throw new ApiError('Unauthorized: No token provided', 401);
  }

  const payload = await verifyToken(token);
  if (!payload || !payload.userId) {
    throw new ApiError('Unauthorized: Invalid token', 401);
  }

  c.set('userId', payload.userId);

  return await next();
});