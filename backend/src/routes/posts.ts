import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
    createPostSchema,
    updatePostSchema,
    paginationSchema,
    apiPostResponseSchema,
    apiPostListResponseSchema,
    apiErrorSchema,
    apiSuccessMessageSchema,
    postListResponseDataSchema,
} from '@/lib/schemas';
import { authMiddleware, AuthVariables } from '@/middleware/auth';
import { apiSuccess } from '@/lib/response';
import { ApiError } from '@/lib/api-error';

export const postRoutes = new OpenAPIHono<{ Variables: AuthVariables }>();

const listPostsRoute = createRoute({
    method: 'get',
    path: '/',
    request: {
        query: paginationSchema
    },
    responses: {
        200: {
            content: { 'application/json': { schema: apiPostListResponseSchema } },
            description: 'A paginated list of posts',
        },
        500: {
            content: { 'application/json': { schema: apiErrorSchema } },
            description: 'Failed to fetch posts',
        },
    },
    tags: ['Posts'],
});

const createPostRoute = createRoute({
    method: 'post',
    path: '/',
    security: [{ CookieAuth: [] }],
    request: {
        body: { content: { 'application/json': { schema: createPostSchema } } }
    },
    responses: {
        201: {
            content: { 'application/json': { schema: apiPostResponseSchema } },
            description: 'The created post',
        },
        401: {
            content: { 'application/json': { schema: apiErrorSchema } },
            description: 'Unauthorized',
        },
        500: {
            content: { 'application/json': { schema: apiErrorSchema } },
            description: 'Failed to create post',
        },
    },
    tags: ['Posts'],
});

const getPostRoute = createRoute({
    method: 'get',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().cuid().openapi({ description: 'The ID of the post' }) })
    },
    responses: {
        200: {
            content: { 'application/json': { schema: apiPostResponseSchema } },
            description: 'Details of the post',
        },
        404: {
            content: { 'application/json': { schema: apiErrorSchema } },
            description: 'Post not found',
        },
        500: {
            content: { 'application/json': { schema: apiErrorSchema } },
            description: 'Failed to fetch post',
        },
    },
    tags: ['Posts'],
});

const updatePostRoute = createRoute({
    method: 'patch',
    path: '/{id}',
    security: [{ CookieAuth: [] }],
    request: {
        params: z.object({ id: z.string().cuid().openapi({ description: 'The ID of the post' }) }),
        body: { content: { 'application/json': { schema: updatePostSchema } } },
    },
    responses: {
        200: {
            content: { 'application/json': { schema: apiPostResponseSchema } },
            description: 'The updated post',
        },
        401: {
            content: { 'application/json': { schema: apiErrorSchema } },
            description: 'Unauthorized',
        },
        403: {
            content: { 'application/json': { schema: apiErrorSchema } },
            description: 'Forbidden (not the author)',
        },
        404: {
            content: { 'application/json': { schema: apiErrorSchema } },
            description: 'Post not found',
        },
        500: {
            content: { 'application/json': { schema: apiErrorSchema } },
            description: 'Failed to update post',
        },
    },
    tags: ['Posts'],
});

const deletePostRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    security: [{ CookieAuth: [] }],
    request: {
        params: z.object({ id: z.string().cuid().openapi({ description: 'The ID of the post' }) })
    },
    responses: {
        200: {
            content: { 'application/json': { schema: apiSuccessMessageSchema } },
            description: 'Post deleted successfully',
        },
        401: {
            content: { 'application/json': { schema: apiErrorSchema } },
            description: 'Unauthorized',
        },
        403: {
            content: { 'application/json': { schema: apiErrorSchema } },
            description: 'Forbidden (not the author)',
        },
        404: {
            content: { 'application/json': { schema: apiErrorSchema } },
            description: 'Post not found',
        },
        500: {
            content: { 'application/json': { schema: apiErrorSchema } },
            description: 'Failed to delete post',
        },
    },
    tags: ['Posts'],
});


postRoutes.on(['POST', 'PATCH', 'DELETE'], '/*', authMiddleware);

postRoutes.openapi(listPostsRoute, async (c) => {
    const { page, limit } = c.req.valid('query');
    const skip = (page - 1) * limit;

    const [posts, total] = await db.$transaction([
        db.post.findMany({
            skip: skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { id: true, name: true, email: true },
                },
            },
        }),
        db.post.count(),
    ]);

    const responseData: z.infer<typeof postListResponseDataSchema> = {
        data: posts,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalItems: total,
    };

    return apiSuccess(c, 'Posts fetched successfully', responseData, 200);
});

postRoutes.openapi(createPostRoute, async (c) => {
    const userId = c.get('userId')!;
    const { title, content } = c.req.valid('json');

    const newPost = await db.post.create({
        data: {
            title,
            content,
            authorId: userId,
        },
        include: {
            author: {
                select: { id: true, name: true, email: true }
            }
        }
    });
    return apiSuccess(c, 'Post created successfully', newPost, 201);
});

postRoutes.openapi(getPostRoute, async (c) => {
    const { id } = c.req.param();

    const post = await db.post.findUnique({
        where: { id },
        include: {
            author: {
                select: { id: true, name: true, email: true },
            },
        },
    });

    if (!post) {
        throw new ApiError('Post not found', 404);
    }
    return apiSuccess(c, 'Post fetched successfully', post, 200);
});

postRoutes.openapi(updatePostRoute, async (c) => {
    const userId = c.get('userId')!;
    const { id } = c.req.param();
    const data = c.req.valid('json');

    const post = await db.post.findUnique({ where: { id } });
    if (!post) {
        throw new ApiError('Post not found', 404);
    }
    if (post.authorId !== userId) {
        throw new ApiError('Forbidden: You are not the author', 403);
    }

    const updatedPost = await db.post.update({
        where: { id },
        data,
        include: {
            author: {
                select: { id: true, name: true, email: true }
            }
        }
    });
    return apiSuccess(c, 'Post updated successfully', updatedPost, 200);
});

postRoutes.openapi(deletePostRoute, async (c) => {
    const userId = c.get('userId')!;
    const { id } = c.req.param();

    const post = await db.post.findFirst({
        where: { id, authorId: userId }
    });

    if (!post) {
        throw new ApiError('Post not found', 404);
    }

    await db.post.delete({ where: { id } });
    return apiSuccess(c, 'Post deleted successfully', null, 200);
});