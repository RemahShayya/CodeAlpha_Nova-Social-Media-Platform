import models from '../models/index.js';
import { isBlockedEitherWay } from './blockService.js';
import { createNotification } from './notificationService.js';

export const createComment = async (userId, postId, content) => {
  const post = await models.Post.findByPk(postId);
  if (!post) return { error: 'Post not found.', status: 404 };

  const blocked = await isBlockedEitherWay(userId, post.userId);
  if (blocked) return { error: 'Post not found.', status: 404 };

  const comment = await models.Comment.create({ userId, postId, content });

  await createNotification({
    recipientId: post.userId,
    actorId: userId,
    type: 'comment',
    postId: post.id,
    commentId: comment.id,
  });

  return { data: comment };
};

export const getCommentsForPost = async (requesterId, postId) => {
  const post = await models.Post.findByPk(postId);
  if (!post) return { error: 'Post not found.', status: 404 };

  const blocked = await isBlockedEitherWay(requesterId, post.userId);
  if (blocked) return { error: 'Post not found.', status: 404 };

  const comments = await models.Comment.findAll({
    where: { postId },
    include: [{ model: models.User, as: 'user', attributes: ['id', 'name', 'profilePicture'] }],
    order: [['createdAt', 'ASC']],
  });

  return { data: comments };
};

export const updateComment = async (requesterId, commentId, content) => {
  const comment = await models.Comment.findByPk(commentId);
  if (!comment) return { error: 'Comment not found.', status: 404 };
  if (comment.userId !== requesterId) return { error: 'You can only edit your own comments.', status: 403 };

  comment.content = content;
  await comment.save();

  return { data: comment };
};

export const deleteComment = async (requesterId, commentId) => {
  const comment = await models.Comment.findByPk(commentId);
  if (!comment) return { error: 'Comment not found.', status: 404 };
  if (comment.userId !== requesterId) return { error: 'You can only delete your own comments.', status: 403 };

  await comment.destroy();

  return { data: { message: 'Comment deleted successfully.' } };
};