import models from '../models/index.js';
import { isBlockedEitherWay } from './blockService.js';
import { createNotification } from './notificationService.js';

export const likePost = async (userId, postId) => {
  const post = await models.Post.findByPk(postId);
  if (!post) return { error: 'Post not found.', status: 404 };

  const blocked = await isBlockedEitherWay(userId, post.userId);
  if (blocked) return { error: 'Post not found.', status: 404 };

  const [, created] = await models.Like.findOrCreate({ where: { userId, postId } });
  if (!created) return { error: 'You have already liked this post.', status: 409 };

  await createNotification({ recipientId: post.userId, actorId: userId, type: 'like', postId: post.id });

  return { data: { message: 'Post liked successfully.' } };
};

export const unlikePost = async (userId, postId) => {
  const deleted = await models.Like.destroy({ where: { userId, postId } });
  if (deleted === 0) return { error: 'You have not liked this post.', status: 404 };

  return { data: { message: 'Post unliked successfully.' } };
};

export const getLikesForPost = async (requesterId, postId) => {
  const post = await models.Post.findByPk(postId);
  if (!post) return { error: 'Post not found.', status: 404 };

  const blocked = await isBlockedEitherWay(requesterId, post.userId);
  if (blocked) return { error: 'Post not found.', status: 404 };

  const likes = await models.Like.findAll({
    where: { postId },
    include: [{
      model: models.User,
      as: 'user',
      attributes: ['id', 'name', 'profilePicture'],
      where: { role: 'user' },
    }],
    order: [['createdAt', 'DESC']],
  });

  return { data: likes.map((l) => l.user) };
};