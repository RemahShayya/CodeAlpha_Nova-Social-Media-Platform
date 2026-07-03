import fs from 'fs/promises';
import { Op } from 'sequelize';
import models from '../models/index.js';
import { isBlockedEitherWay, getBlockedUserIds } from './blockService.js';

// ─── helpers ────────────────────────────────────────────────────────────────
// Block-check logic now lives in services/blockService.js — single source
// of truth shared across Posts, Comments, and Likes (previously a local
// duplicate here; see README correction #6).

const paginate = ({ page, pageSize }) => ({
  limit: pageSize,
  offset: (page - 1) * pageSize,
});

// ─── create ──────────────────────────────────────────────────────────────────

export const createPost = async (userId, { caption, mediaUrl, mediaType }) => {
  const post = await models.Post.create({
    userId,
    caption: caption ?? null,
    mediaUrl,
    mediaType,
  });

  return { data: post };
};

// ─── single post ─────────────────────────────────────────────────────────────

export const getPostById = async (requesterId, postId) => {
  const post = await models.Post.findByPk(postId, {
    include: [{ model: models.User, as: 'User', attributes: ['id', 'name', 'profilePicture'] }],
  });
  if (!post) return { error: 'Post not found.', status: 404 };

  const blocked = await isBlockedEitherWay(requesterId, post.userId);
  if (blocked) return { error: 'Post not found.', status: 404 };

  return { data: post };
};

// ─── feed (posts from users the requester follows) ───────────────────────────

export const getFeed = async (requesterId, { page, pageSize }) => {
  // Equivalent of an EF Core query joining Follow → Post on followingId,
  // filtered to the current user's followerId, then ordered and paged.
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

// ─── a specific user's posts ──────────────────────────────────────────────────

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

// ─── update (caption only — media is immutable) ───────────────────────────────

export const updatePost = async (requesterId, postId, { caption }) => {
  const post = await models.Post.findByPk(postId);
  if (!post) return { error: 'Post not found.', status: 404 };

  // Ownership check — equivalent of comparing the resource's UserId
  // against the authenticated ClaimsPrincipal's id in a .NET service
  // method before allowing a mutation.
  if (post.userId !== requesterId) {
    return { error: 'You can only edit your own posts.', status: 403 };
  }

  if (caption !== undefined) post.caption = caption;
  await post.save();

  return { data: post };
};

// ─── delete (also removes the media file from disk) ───────────────────────────

export const deletePost = async (requesterId, postId) => {
  const post = await models.Post.findByPk(postId);
  if (!post) return { error: 'Post not found.', status: 404 };

  if (post.userId !== requesterId) {
    return { error: 'You can only delete your own posts.', status: 403 };
  }

  // Remove the media file first — if this throws for a reason other than
  // "file already gone," we still want the DB row removed afterward, so
  // failures here are swallowed the same way profile picture deletion
  // does it in userService.js.
  try {
    await fs.unlink(post.mediaUrl);
  } catch {
    // Ignore missing file
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