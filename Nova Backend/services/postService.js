import fs from 'fs/promises';
import { Op } from 'sequelize';
import models from '../models/index.js';
import { isBlockedEitherWay, getBlockedUserIds } from './blockService.js';
const paginate = ({ page, pageSize }) => ({
  limit: pageSize,
  offset: (page - 1) * pageSize,
});
export const createPost = async (userId, { caption, mediaUrl, mediaType }) => {
  const post = await models.Post.create({
    userId,
    caption: caption ?? null,
    mediaUrl,
    mediaType,
  });
  return { data: post };
};
export const getPostById = async (requesterId, postId) => {
  const post = await models.Post.findByPk(postId, {
    include: [{ model: models.User, as: 'User', attributes: ['id', 'name', 'profilePicture'] }],
  });
  if (!post) return { error: 'Post not found.', status: 404 };
  const blocked = await isBlockedEitherWay(requesterId, post.userId);
  if (blocked) return { error: 'Post not found.', status: 404 };
  return { data: post };
};
export const getFeed = async (requesterId, { page, pageSize }) => {
  const follows = await models.Follow.findAll({
    where: { followerId: requesterId },
    attributes: ['followingId'],
  });
  const followingIds = follows.map((f) => f.followingId);
  if (followingIds.length === 0) {
    return { data: { posts: [], page, pageSize, total: 0 } };
  }
  const blockedIds = await getBlockedUserIds(requesterId);
  const visibleAuthorIds = followingIds.filter((id) => !blockedIds.includes(id));
  if (visibleAuthorIds.length === 0) {
    return { data: { posts: [], page, pageSize, total: 0 } };
  }
  const { count, rows } = await models.Post.findAndCountAll({
    where: { userId: { [Op.in]: visibleAuthorIds } },
    include: [{ model: models.User, as: 'User', attributes: ['id', 'name', 'profilePicture'], required: true }],
    order: [['createdAt', 'DESC']],
    ...paginate({ page, pageSize }),
  });
  return { data: { posts: rows, page, pageSize, total: count } };
};
export const getUserPosts = async (requesterId, targetUserId, { page, pageSize }) => {
  const target = await models.User.findByPk(targetUserId);
  if (!target) return { error: 'User not found.', status: 404 };
  const blocked = await isBlockedEitherWay(requesterId, targetUserId);
  if (blocked) return { error: 'User not found.', status: 404 };
  const { count, rows } = await models.Post.findAndCountAll({
    where: { userId: targetUserId },
    order: [['createdAt', 'DESC']],
    ...paginate({ page, pageSize }),
  });
  return { data: { posts: rows, page, pageSize, total: count } };
};
export const updatePost = async (requesterId, postId, { caption }) => {
  const post = await models.Post.findByPk(postId);
  if (!post) return { error: 'Post not found.', status: 404 };
  if (post.userId !== requesterId) {
    return { error: 'You can only edit your own posts.', status: 403 };
  }
  if (caption !== undefined) post.caption = caption;
  await post.save();
  return { data: post };
};
export const deletePost = async (requesterId, postId) => {
  const post = await models.Post.findByPk(postId);
  if (!post) return { error: 'Post not found.', status: 404 };
  if (post.userId !== requesterId) {
    return { error: 'You can only delete your own posts.', status: 403 };
  }
  try {
    await fs.unlink(post.mediaUrl);
  } catch {
  }
  await post.destroy();
  return { data: { message: 'Post deleted successfully.' } };
};
export const searchPosts = async (requesterId, { q, page, pageSize }) => {
  const blockedIds = await getBlockedUserIds(requesterId);
  const where = { caption: { [Op.iLike]: `%${q}%` } };
  if (blockedIds.length > 0) {
    where.userId = { [Op.notIn]: blockedIds };
  }
  const { count, rows } = await models.Post.findAndCountAll({
    where,
    include: [{ model: models.User, as: 'User', attributes: ['id', 'name', 'profilePicture'], required: true }],
    order: [['createdAt', 'DESC']],
    ...paginate({ page, pageSize }),
  });
  return { data: { posts: rows, page, pageSize, total: count } };
};