import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from '../services/notificationService.js';

export const listNotifications = async (req, res, next) => {
  try {
    const { page, pageSize } = req.query;
    const result = await getNotifications(req.user.id, { page, pageSize });
    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }
    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    const result = await markAsRead(req.user.id, req.params.id);
    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }
    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};

export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const result = await markAllAsRead(req.user.id);
    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }
    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};

export const getUnreadNotificationCount = async (req, res, next) => {
  try {
    const result = await getUnreadCount(req.user.id);
    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }
    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};