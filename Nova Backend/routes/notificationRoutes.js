import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/jwtAuthenticationMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { listNotificationsSchema, notificationIdParamSchema } from '../validators/notificationValidator.js';
import {
  listNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
} from '../controllers/notificationController.js';

const router = Router();

// Notifications are a user-only concept — admins don't participate in the
// social graph, so they can't have notifications either (mirrors the
// requireRole('user') rule used for every other social action).
router.use(authenticate, requireRole('user'));

// Literal paths before parameterized ones (route-ordering rule).
router.get('/', validate(listNotificationsSchema), listNotifications);
router.get('/unread-count', getUnreadNotificationCount);
router.put('/read-all', markAllNotificationsAsRead);
router.put('/:id/read', validate(notificationIdParamSchema), markNotificationAsRead);

export default router;