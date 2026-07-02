import { z } from 'zod';

const paginationQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
});

export const listNotificationsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: paginationQuery,
});

export const notificationIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: z.string().uuid('Invalid notification ID.') }),
  query: z.object({}).optional(),
});