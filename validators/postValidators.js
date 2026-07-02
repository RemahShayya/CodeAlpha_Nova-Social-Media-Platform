import { z } from 'zod';

const uuidParam = z.object({ id: z.string().uuid('Invalid post ID.') });
const userIdParam = z.object({ id: z.string().uuid('Invalid user ID.') });
const paginationQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
});

export const createPostSchema = z.object({
  body: z.object({
    caption: z.string().max(1000, 'Caption cannot exceed 1000 characters.').optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updatePostSchema = z.object({
  body: z.object({
    caption: z.string().max(1000, 'Caption cannot exceed 1000 characters.').optional(),
  }),
  params: uuidParam,
  query: z.object({}).optional(),
});

export const postIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: uuidParam,
  query: z.object({}).optional(),
});

export const feedQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: paginationQuery,
});

export const userPostsSchema = z.object({
  body: z.object({}).optional(),
  params: userIdParam,
  query: paginationQuery,
});

export const searchPostsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    q: z.string().min(1, 'Search query cannot be empty.').max(1000),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(10),
  }),
});