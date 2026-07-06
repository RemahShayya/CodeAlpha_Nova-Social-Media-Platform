import fs from 'fs/promises';
import bcrypt from 'bcrypt';
import models from '../models/index.js';
import env from '../config/env.js';
import sanitizeUser from '../utiles/sanitizeUser.js';
import { Op } from 'sequelize';
const isUuid = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
const saltRounds = env.SALT_ROUNDS;
export const createAdmin = async ({ name, email, password }) => {
  const existing = await models.User.findOne({ where: { email } });
  if (existing) {
    return { error: 'Email already in use', status: 409 };
  }
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const user = await models.User.create({
    name,
    email,
    passwordHash,
    role: 'admin',
    isEmailVerified: true,
  });
  return { user: sanitizeUser(user) };
};
export const removeUser = async (targetId) => {
  const user = await models.User.findOne({
    where: { id: targetId },
    paranoid: false,
  });
  if (!user) return { error: 'User not found.', status: 404 };
  if (user.role === 'admin') {
    return { error: 'Admin accounts cannot be removed this way.', status: 403 };
  }
  if (user.deletedAt) {
    return { error: 'User is already deactivated.', status: 409 };
  }
  if (user.profilePicture) {
    try { await fs.unlink(user.profilePicture); } catch {  }
    user.profilePicture = null;
    await user.save({ paranoid: false });
  }
  await user.destroy();
  return { data: { message: 'User deactivated successfully.' } };
};
export const restoreUser = async (targetId) => {
  const user = await models.User.findOne({
    where: { id: targetId },
    paranoid: false,
  });
  if (!user) return { error: 'User not found.', status: 404 };
  if (!user.deletedAt) {
    return { error: 'User is not deactivated.', status: 409 };
  }
  await user.restore();
  return { data: { message: 'User restored successfully.' } };
};
export const removePost = async (postId) => {
  const post = await models.Post.findByPk(postId);
  if (!post) return { error: 'Post not found.', status: 404 };
  try { await fs.unlink(post.mediaUrl); } catch {  }
  await post.destroy();
  return { data: { message: 'Post removed successfully.' } };
};
export const removeComment = async (commentId) => {
  const comment = await models.Comment.findByPk(commentId);
  if (!comment) return { error: 'Comment not found.', status: 404 };
  await comment.destroy();
  return { data: { message: 'Comment removed successfully.' } };
};
export const getDeactivatedUsers = async ({ q, page, pageSize }) => {
  const where = {
    role: 'user',
    deletedAt: { [Op.ne]: null },
  };
  if (q) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${q}%` } },
      ...(isUuid(q) ? [{ id: q }] : []),
    ];
  }
  const { count, rows } = await models.User.findAndCountAll({
    where,
    paranoid: false,
    attributes: ['id', 'name', 'email', 'profilePicture', 'deletedAt'],
    order: [['deletedAt', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
  return { data: { users: rows, page, pageSize, total: count } };
};