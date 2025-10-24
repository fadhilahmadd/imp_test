import { z } from 'zod';

// --- Base Schemas ---

export const userSchema = z.object({
    id: z.string().cuid().openapi({ example: 'clx1v2q0e0000a4c8n2y7f6z0' }),
    name: z.string().openapi({ example: 'Dodi' }),
    email: z.string().email().openapi({ example: 'user@example.com' }),
    createdAt: z
        .string()
        .datetime()
        .openapi({ example: '2025-01-01T00:00:00.000Z' }),
});

export const userResponseSchema = userSchema.omit({ createdAt: true });

export const postSchema = z.object({
    id: z.string().cuid().openapi({ example: 'clx1v3a0b0001a4c8f8q9e0d1' }),
    title: z.string().openapi({ example: 'My First Post' }),
    content: z.string().openapi({ example: 'Hello, world!' }),
    published: z.boolean().openapi({ example: true }),

    createdAt: z.date().openapi({
        type: 'string',
        format: 'date-time',
        example: '2025-01-01T00:00:00.000Z',
    }),

    updatedAt: z.date().openapi({
        type: 'string',
        format: 'date-time',
        example: '2025-01-01T00:00:00.000Z',
    }),

    author: userResponseSchema.optional(),
});

// --- Request/Input Schemas ---

export const signUpSchema = z.object({
    name: z.string().min(1, 'Name is required').openapi({ example: 'Dodi' }),
    email: z.string().email().openapi({ example: 'user@example.com' }),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .openapi({ example: 'password123' }),
});

export const signInSchema = z.object({
    email: z.string().email().openapi({ example: 'user@example.com' }),
    password: z.string().min(1, 'Password is required').openapi({ example: 'password123' }),
});

export const createPostSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255).openapi({ example: 'New Post Title' }),
    content: z.string().min(1, 'Content is required').openapi({ example: 'Content of the new post...' }),
});

export const updatePostSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255).optional().openapi({ example: 'Updated Title' }),
    content: z.string().min(1, 'Content is required').optional().openapi({ example: 'Updated content...' }),
});

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1).openapi({
        example: 1,
        description: 'The page number to retrieve.'
    }),
    limit: z.coerce.number().int().min(1).max(100).default(10).openapi({
        example: 10,
        description: 'The number of items per page.'
    }),
});

export const postListResponseDataSchema = z.object({
    data: z.array(postSchema),
    totalPages: z.number().int().openapi({ example: 10 }),
    currentPage: z.number().int().openapi({ example: 1 }),
    totalItems: z.number().int().openapi({ example: 100 }),
});


export const apiErrorSchema = z.object({
    success: z.boolean().openapi({ example: false }),
    message: z.string().openapi({ example: 'Unauthorized' }),
    data: z.null().openapi({ example: null }),
});

export const apiSuccessMessageSchema = z.object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: 'Operation completed successfully' }),
    data: z.null().openapi({ example: null }),
});

export const apiUserResponseSchema = z.object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: 'User details fetched' }),
    data: userResponseSchema,
});

export const apiPostResponseSchema = z.object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: 'Post details fetched' }),
    data: postSchema,
});

export const apiPostListResponseSchema = z.object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: 'Posts fetched successfully' }),
    data: postListResponseDataSchema,
});