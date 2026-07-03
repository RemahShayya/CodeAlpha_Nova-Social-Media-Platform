import { z } from 'zod';

const uuidParam = z.object({
  id: z.string().uuid('Invalid user ID.'),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name cannot be empty.').max(50).optional(),
    bio: z.string().max(160, 'Bio cannot exceed 160 characters.').optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const userIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: uuidParam,
  query: z.object({}).optional(),
});

export const searchUsersSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    q: z.string().min(1, 'Search query cannot be empty.').max(50),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(10),
  }),
});