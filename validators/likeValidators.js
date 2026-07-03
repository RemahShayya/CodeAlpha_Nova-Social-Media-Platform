import { z } from 'zod';

const postIdParam = z.object({
  postId: z.string().uuid('Invalid post ID.'),
});

export const postIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: postIdParam,
  query: z.object({}).optional(),
});
