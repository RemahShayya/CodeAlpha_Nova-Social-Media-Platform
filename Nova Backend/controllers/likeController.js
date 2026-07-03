import * as likeService from '../services/likeService.js';

export const likePost = async (req, res, next) => {
  try {
    const result = await likeService.likePost(req.user.id, req.params.postId);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(201).json(result.data);
  } catch (err) {
    next(err);
  }
};

export const unlikePost = async (req, res, next) => {
  try {
    const result = await likeService.unlikePost(req.user.id, req.params.postId);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};

export const getLikesForPost = async (req, res, next) => {
  try {
    const result = await likeService.getLikesForPost(req.user.id, req.params.postId);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json( result.data );
  } catch (err) {
    next(err);
  }
};
