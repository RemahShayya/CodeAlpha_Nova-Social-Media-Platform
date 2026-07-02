import { z } from 'zod';

export const userIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: z.string().uuid('Invalid user ID.') }),
  query: z.object({}).optional(),
});

export const postIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: z.string().uuid('Invalid post ID.') }),
  query: z.object({}).optional(),
});

export const commentIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: z.string().uuid('Invalid comment ID.') }),
  query: z.object({}).optional(),
});
