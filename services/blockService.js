import { Op } from 'sequelize';
import models from '../models/index.js';

/**
 * True if there is a Block row in either direction between userAId and
 * userBId. Single source of truth — previously duplicated locally inside
 * postService.js; now imported by every module that needs visibility
 * checks (Posts, Comments, Likes, and Users).
 */
export const isBlockedEitherWay = async (userAId, userBId) => {
  const block = await models.Block.findOne({
    where: {
      [Op.or]: [
        { blockerId: userAId, blockedId: userBId },
        { blockerId: userBId, blockedId: userAId },
      ],
    },
  });
  return !!block;
};

/**
 * Returns the list of userIds blocked in either direction relative to
 * requesterId — used to filter a list query's WHERE clause (e.g. feed,
 * likes list) without an N+1 per-row block check.
 */
export const getBlockedUserIds = async (requesterId) => {
  const blocks = await models.Block.findAll({
    where: { [Op.or]: [{ blockerId: requesterId }, { blockedId: requesterId }] },
  });
  const ids = new Set();
  blocks.forEach((b) => ids.add(b.blockerId === requesterId ? b.blockedId : b.blockerId));
  return Array.from(ids);
};
