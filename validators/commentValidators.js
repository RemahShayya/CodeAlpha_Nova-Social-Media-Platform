import { z } from 'zod';

const postIdParam = z.object({
  postId: z.string().uuid('Invalid post ID.'),
});

const commentIdParam = z.object({
  id: z.string().uuid('Invalid comment ID.'),
});

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment cannot be empty.').max(500, 'Comment cannot exceed 500 characters.'),
  }),
  params: postIdParam,
  query: z.object({}).optional(),
});

export const listCommentsSchema = z.object({
  body: z.object({}).optional(),
  params: postIdParam,
  query: z.object({}).optional(),
});

export const updateCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment cannot be empty.').max(500, 'Comment cannot exceed 500 characters.'),
  }),
  params: commentIdParam,
  query: z.object({}).optional(),
});

export const commentIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: commentIdParam,
  query: z.object({}).optional(),
});
