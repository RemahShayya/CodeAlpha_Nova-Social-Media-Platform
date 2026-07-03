import models from '../models/index.js';

const paginate = ({ page, pageSize }) => ({ limit: pageSize, offset: (page - 1) * pageSize });

export const createNotification = async ({ recipientId, actorId, type, postId, commentId }) => {
  if (recipientId === actorId) return { data: null };

  const notification = await models.Notification.create({
    recipientId,
    actorId,
    type,
    postId: postId ?? null,
    commentId: commentId ?? null,
  });

  return { data: notification };
};

export const getNotifications = async (userId, { page, pageSize }) => {
  const { count, rows } = await models.Notification.findAndCountAll({
    where: { recipientId: userId },
    include: [
      { model: models.User, as: 'Actor', attributes: ['id', 'name', 'profilePicture'], required: true },
      { model: models.Post, as: 'Post', attributes: ['id', 'caption', 'mediaUrl'] },
      { model: models.Comment, as: 'Comment', attributes: ['id', 'content'] },
    ],
    order: [['createdAt', 'DESC']],
    ...paginate({ page, pageSize }),
  });

  return { data: { notifications: rows, page, pageSize, total: count } };
};

export const markAsRead = async (userId, notificationId) => {
  const notification = await models.Notification.findByPk(notificationId);
  if (!notification) return { error: 'Notification not found.', status: 404 };
  if (notification.recipientId !== userId) {
    return { error: 'You can only update your own notifications.', status: 403 };
  }

  if (!notification.isRead) {
    notification.isRead = true;
    await notification.save();
  }

  return { data: notification };
};

export const markAllAsRead = async (userId) => {
  await models.Notification.update(
    { isRead: true },
    { where: { recipientId: userId, isRead: false } }
  );

  return { data: { message: 'All notifications marked as read.' } };
};
export const getUnreadCount = async (userId) => {
  const count = await models.Notification.count({
    where: { recipientId: userId, isRead: false },
    include: [{ model: models.User, as: 'Actor', attributes: [], required: true }],
  });
  return { data: { count } };
};