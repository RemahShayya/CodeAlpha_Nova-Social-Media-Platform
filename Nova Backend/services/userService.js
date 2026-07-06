import models from '../models/index.js';
import fs from 'fs/promises';
import sanitizeUser from '../utiles/sanitizeUser.js';
import {getBlockedUserIds} from './blockService.js';
import { Op } from 'sequelize';
import { sequelize } from '../models/index.js';
const findBlock = async (actorId, targetId) => {
  return models.Block.findOne({
    where: {
      blockerId: actorId,
      blockedId: targetId,
    },
  });
};
const findReverseBlock = async (actorId, targetId) => {
  return models.Block.findOne({
    where: {
      blockerId: targetId,
      blockedId: actorId,
    },
  });
};
export const getOwnProfile = async (userId) => {
  const user = await models.User.findByPk(userId);
  if (!user) return { error: 'User not found.', status: 404 };
  return { data: sanitizeUser(user) };
};
export const updateOwnProfile = async (userId, { name, bio, profilePicture }) => {
  const user = await models.User.findByPk(userId);
  if (!user) {
    return { error: 'User not found.', status: 404 };
  }
  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (profilePicture !== undefined) {
    if (user.profilePicture) {
      try {
        await fs.unlink(user.profilePicture);
      } catch {
      }
    }
    user.profilePicture = profilePicture;
  }
  await user.save();
  return { data: sanitizeUser(user) };
};
export const getPublicProfile = async (requesterId, targetId) => {
  const target = await models.User.findByPk(targetId);
  if (!target) return { error: 'User not found.', status: 404 };
  const blocked = await findBlock(requesterId, targetId);
  const blockedBy = await findReverseBlock(requesterId, targetId);
  if (blocked || blockedBy) return { error: 'User not found.', status: 404 };
  const safe = sanitizeUser(target);
  const [followerCount, followingCount] = await Promise.all([
  models.Follow.count({
    where: { followingId: targetId },
    include: [{ model: models.User, as: 'Follower', attributes: [], required: true }],
  }),
  models.Follow.count({
    where: { followerId: targetId },
    include: [{ model: models.User, as: 'Following', attributes: [], required: true }],
  }),
]);
  return { data: { ...safe, followerCount, followingCount } };
};
export const followUser = async (followerId, followingId) => {
  if (followerId === followingId) {
    return { error: 'You cannot follow yourself.', status: 400 };
  }
  const target = await models.User.findByPk(followingId);
  if (!target) return { error: 'User not found.', status: 404 };
  const blocked = await findBlock(followerId, followingId);
  if (blocked) return { error: 'You have blocked this user.', status: 403 };
  const blockedBy = await findReverseBlock(followerId, followingId);
  if (blockedBy) return { error: 'User not found.', status: 404 };
  const [, created] = await models.Follow.findOrCreate({
    where: { followerId, followingId },
  });
  if (!created) return { error: 'You are already following this user.', status: 409 };
  return { data: { message: 'User followed successfully.' } };
};
export const unfollowUser = async (followerId, followingId) => {
  if (followerId === followingId) {
    return { error: 'You cannot unfollow yourself.', status: 400 };
  }
  const deleted = await models.Follow.destroy({
    where: { followerId, followingId },
  });
  if (deleted === 0) return { error: 'You are not following this user.', status: 404 };
  return { data: { message: 'User unfollowed successfully.' } };
};
export const blockUser = async (blockerId, blockedId) => {
  if (blockerId === blockedId) {
    return { error: 'You cannot block yourself.', status: 400 };
  }
  const target = await models.User.findByPk(blockedId);
  if (!target) return { error: 'User not found.', status: 404 };
  const [, created] = await models.Block.findOrCreate({
    where: { blockerId, blockedId },
  });
  if (!created) return { error: 'You have already blocked this user.', status: 409 };
  await models.Follow.destroy({
    where: [
      { followerId: blockerId, followingId: blockedId },
      { followerId: blockedId, followingId: blockerId },
    ],
  });
  return { data: { message: 'User blocked successfully.' } };
};
export const unblockUser = async (blockerId, blockedId) => {
  if (blockerId === blockedId) {
    return { error: 'You cannot unblock yourself.', status: 400 };
  }
  const deleted = await models.Block.destroy({
    where: { blockerId, blockedId },
  });
  if (deleted === 0) return { error: 'You have not blocked this user.', status: 404 };
  return { data: { message: 'User unblocked successfully.' } };
};
export const getFollowers = async (requesterId, targetId) => {
  const target = await models.User.findByPk(targetId);
  if (!target) return { error: 'User not found.', status: 404 };
  const blockedBy = await findReverseBlock(requesterId, targetId);
  if (blockedBy) return { error: 'User not found.', status: 404 };
const follows = await models.Follow.findAll({
  where: { followingId: targetId },
  include: [{
    model: models.User,
    as: 'Follower',
    attributes: ['id', 'name', 'profilePicture', 'bio'],
  }],
  order: [['createdAt', 'DESC']],
});
const followers = follows.map(f => f.Follower);
  const followeRows = follows.map((f) => f.Follower);
  return { data: followers };
};
export const getFollowing = async (requesterId, targetId) => {
  const target = await models.User.findByPk(targetId);
  if (!target) return { error: 'User not found.', status: 404 };
  const blockedBy = await findReverseBlock(requesterId, targetId);
  if (blockedBy) return { error: 'User not found.', status: 404 };
const follows = await models.Follow.findAll({
  where: { followerId: targetId },
  include: [{
    model: models.User,
    as: 'Following',
    attributes: ['id', 'name', 'profilePicture', 'bio'],
  }],
  order: [['createdAt', 'DESC']],
});
const following = follows.map(f => f.Following);
  const followingRows = follows.map((f) => f.Following);
  return { data: following };
};
export const deleteProfilePicture = async (userId) => {
  const user = await models.User.findByPk(userId);
  if (!user) {
    return { error: 'User not found.', status: 404 };
  }
  if (!user.profilePicture) {
    return { error: 'No profile picture to delete.', status: 404 };
  }
  try {
    await fs.unlink(user.profilePicture);
  } catch {
  }
  user.profilePicture = null;
  await user.save();
  return {
    data: {
      message: 'Profile picture deleted successfully.',
    },
  };
};
export const searchUsers = async (requesterId, { q, page, pageSize }) => {
  const blockedIds = await getBlockedUserIds(requesterId);
  const excludedIds = [requesterId, ...blockedIds];
  const { count, rows } = await models.User.findAndCountAll({
    where: {
      role: 'user',
      name: { [Op.iLike]: `%${q}%` },
      id: { [Op.notIn]: excludedIds },
    },
    order: [
      [sequelize.literal(`CASE WHEN "name" ILIKE ${sequelize.escape(q)} THEN 0 ELSE 1 END`), 'ASC'],
      ['name', 'ASC'],
    ],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
  return { data: { users: rows.map(sanitizeUser), page, pageSize, total: count } };
};