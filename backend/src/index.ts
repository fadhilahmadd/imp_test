import 'dotenv/config';
import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { authRoutes } from '@/routes/auth';
import { postRoutes } from '@/routes/posts';
import { ApiError } from '@/lib/api-error';
import { z } from 'zod';

const app = new OpenAPIHono();

app.use(logger());
app.use(
    '/api/*',
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    }),
);

app.route('/api/auth', authRoutes);
app.route('/api/posts', postRoutes);

if (process.env.NODE_ENV !== 'production') {
    app.get(
        '/api/doc',
        swaggerUI({
            url: '/api/openapi.json',
        }),
    );

    app.openAPIRegistry.registerComponent('securitySchemes', 'CookieAuth', {
        type: 'apiKey',
        in: 'cookie',
        name: 'auth_token',
    });

    app.doc('/api/openapi.json', {
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'API Documentation',
            description: 'API post management application',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 8000}`,
                description: 'Development server',
            },
        ],
        tags: [
            { name: 'Auth', description: 'User authentication endpoints' },
            { name: 'Posts', description: 'Post management endpoints' },
        ]
    });
}

app.onError((err, c) => {
    if (err instanceof ApiError) {
        return c.json(
            {
                success: false,
                message: err.message,
                data: null,
            },
            { status: err.statusCode }
        );
    }

    if (err instanceof z.ZodError) {
        return c.json(
            {
                success: false,
                message: 'Validation failed',
                data: err.issues,
            },
            400
        );
    }

    console.error('Global unhandled error:', err);
    return c.json(
        {
            success: false,
            message: 'Internal Server Error',
            data: null,
        },
        500
    );
});

const port = parseInt(process.env.PORT || '8000');

serve(
    {
        fetch: app.fetch,
        port: port,
    },
    () => {
        console.log(`🟢 Backend server running on http://localhost:${port}`);
    },
);

export default app;