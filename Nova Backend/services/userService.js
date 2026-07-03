import models from '../models/index.js';
import fs from 'fs/promises';
import sanitizeUser from '../utiles/sanitizeUser.js';
import {getBlockedUserIds} from './blockService.js';
import { Op } from 'sequelize';
import { sequelize } from '../models/index.js';
// ─── helpers ────────────────────────────────────────────────────────────────

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


// ─── profile ─────────────────────────────────────────────────────────────────

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

    // Delete previous picture if there was one
    if (user.profilePicture) {
      try {
        await fs.unlink(user.profilePicture);
      } catch {
        // Ignore if file doesn't exist
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

  // A blocked user (in either direction) gets a 404 so they can't even
  // confirm the account exists — same idea as returning 404 instead of 403
  // on sensitive ASP.NET Core endpoints to avoid leaking information.
  const blocked = await findBlock(requesterId, targetId);
  const blockedBy = await findReverseBlock(requesterId, targetId);
  if (blocked || blockedBy) return { error: 'User not found.', status: 404 };

  const safe = sanitizeUser(target);

  // Attach follower / following counts so the client can display them
  // without an extra round-trip.
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

// ─── follow / unfollow ───────────────────────────────────────────────────────

export const followUser = async (followerId, followingId) => {
  if (followerId === followingId) {
    return { error: 'You cannot follow yourself.', status: 400 };
  }

  const target = await models.User.findByPk(followingId);
  if (!target) return { error: 'User not found.', status: 404 };

  // Block guard — checked before any write, as per the design decision in
  // the README ("Block enforcement is service-layer logic").
  const blocked = await findBlock(followerId, followingId);
  if (blocked) return { error: 'You have blocked this user.', status: 403 };

  const blockedBy = await findReverseBlock(followerId, followingId);
  if (blockedBy) return { error: 'User not found.', status: 404 };

  // findOrCreate is Sequelize's equivalent of EF Core's
  // context.Set<T>().FirstOrDefaultAsync() followed by context.Add() —
  // it issues a SELECT then an INSERT only if not found, all in one call.
  // The unique composite index on (followerId, followingId) acts as the
  // DB-level safety net, but findOrCreate avoids a duplicate error entirely.
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

  // destroy() returns the number of rows deleted — 0 means the follow
  // record didn't exist, analogous to checking DeleteResult.DeletedCount
  // in EF Core after ExecuteDeleteAsync.
  if (deleted === 0) return { error: 'You are not following this user.', status: 404 };

  return { data: { message: 'User unfollowed successfully.' } };
};

// ─── block / unblock ─────────────────────────────────────────────────────────

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

  // When A blocks B, any existing follow relationship between them is
  // removed in both directions — you wouldn't want a blocked user to keep
  // seeing your posts via their following feed.  This is a cascading side
  // effect handled in the service, not the DB (no ON DELETE CASCADE fits
  // this conditional logic).
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

// ─── followers / following lists ─────────────────────────────────────────────

export const getFollowers = async (requesterId, targetId) => {
  const target = await models.User.findByPk(targetId);
  if (!target) return { error: 'User not found.', status: 404 };

  const blockedBy = await findReverseBlock(requesterId, targetId);
  if (blockedBy) return { error: 'User not found.', status: 404 };

  // Sequelize include with a through-model — the .NET mental model here is
  // a navigation property loaded via .Include().ThenInclude() in EF Core.
  // We join Follow → User to get the actual follower records.
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
    // Ignore missing file
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
      // Exact (case-insensitive) name matches rank first, then alphabetical.
      [sequelize.literal(`CASE WHEN "name" ILIKE ${sequelize.escape(q)} THEN 0 ELSE 1 END`), 'ASC'],
      ['name', 'ASC'],
    ],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return { data: { users: rows.map(sanitizeUser), page, pageSize, total: count } };
};