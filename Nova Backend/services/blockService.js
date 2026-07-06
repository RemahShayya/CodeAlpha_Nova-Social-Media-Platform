import { Op } from 'sequelize';
import models from '../models/index.js';
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
export const getBlockedUserIds = async (requesterId) => {
  const blocks = await models.Block.findAll({
    where: { [Op.or]: [{ blockerId: requesterId }, { blockedId: requesterId }] },
  });
  const ids = new Set();
  blocks.forEach((b) => ids.add(b.blockerId === requesterId ? b.blockedId : b.blockerId));
  return Array.from(ids);
};
