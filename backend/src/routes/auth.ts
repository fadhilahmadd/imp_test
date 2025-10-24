import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { db } from '@/lib/db';
import {
    hashPassword,
    comparePassword,
    createToken,
    setAuthCookie,
    clearAuthCookie,
} from '@/lib/auth';
import {
    signInSchema,
    signUpSchema,
    apiUserResponseSchema,
    apiErrorSchema,
    apiSuccessMessageSchema,
} from '@/lib/schemas';
import { authMiddleware, AuthVariables } from '@/middleware/auth';
import { apiSuccess } from '@/lib/response';
import { ApiError } from '@/lib/api-error';

export const authRoutes = new OpenAPIHono<{ Variables: AuthVariables }>();

const signUpRoute = createRoute({
    method: 'post',
    path: '/signup',
    request: {
        body: {
            content: { 'application/json': { schema: signUpSchema } },
        },
    },
    responses: {
        201: {
            content: { 'application/json': { schema: apiUserResponseSchema } },
            description: 'Account created successfully',
        },
        409: {
            content: { 'application/json': { schema: apiErrorSchema } },
            description: 'Email already in use',
        },
        500: {
            content: { 'application/json': { schema: apiErrorSchema } },
            description: 'Internal server error',
        },
    },
    tags: ['Auth'],
});

const signInRoute = createRoute({
    method: 'post',
    path: '/signin',
    request: {
        body: {
            content: { 'application/json': { schema: signInSchema } },
        },
    },
    responses: {
        200: {
            content: { 'application/json': { schema: apiUserResponseSchema } },
            description: 'Signed in successfully',
        },
        401: {
            content: { 'application/json': { schema: apiErrorSchema } },
            description: 'Invalid email or password',
        },
        500: {
            content: { 'application/json': { schema: apiErrorSchema } },
            description: 'Internal server error',
        },
    },
    tags: ['Auth'],
});

const signOutRoute = createRoute({
    method: 'post',
    path: '/signout',
    responses: {
        200: {
            content: { 'application/json': { schema: apiSuccessMessageSchema } },
            description: 'Signed out successfully',
        },
    },
    tags: ['Auth'],
});

const getMeRoute = createRoute({
    method: 'get',
    path: '/me',
    security: [{ CookieAuth: [] }],
    responses: {
        200: {
            content: { 'application/json': { schema: apiUserResponseSchema } },
            description: 'Current user details',
        },
        401: {
            content: { 'application/json': { schema: apiErrorSchema } },
            description: 'Unauthorized',
        },
        404: {
            content: { 'application/json': { schema: apiErrorSchema } },
            description: 'User not found',
        },
    },
    tags: ['Auth'],
});

authRoutes.openapi(signUpRoute, async (c) => {
    const { name, email, password } = c.req.valid('json');

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new ApiError('Email already in use', 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
        data: { name, email, passwordHash },
        select: { id: true, name: true, email: true },
    });

    return apiSuccess(c, 'Account created successfully', user, 201);
},
);

authRoutes.openapi(signInRoute, async (c) => {
    const { email, password } = c.req.valid('json');

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError('Invalid email or password', 401);
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new ApiError('Invalid email or password', 401);
    }

    const token = await createToken(user.id);
    setAuthCookie(c, token);

    return apiSuccess(c, 'Signed in successfully', {
        id: user.id,
        name: user.name,
        email: user.email,
    }, 200);
},
);

authRoutes.openapi(signOutRoute, (c) => {
    clearAuthCookie(c);
    return apiSuccess(c, 'Signed out successfully', null, 200);
},
);

authRoutes.use('/me', authMiddleware);

authRoutes.openapi(
    getMeRoute,
    async (c) => {
        const userId = c.get('userId');

        const user = await db.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true },
        });

        if (!user) {
            clearAuthCookie(c);
            throw new ApiError('User not found', 404);
        }

        return apiSuccess(c, 'Current user details fetched', user, 200);
    },
);