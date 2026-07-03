import * as commentService from '../services/commentService.js';

export const createComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const result = await commentService.createComment(req.user.id, req.params.postId, content);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(201).json( result.data );
  } catch (err) {
    next(err);
  }
};

export const getCommentsForPost = async (req, res, next) => {
  try {
    const result = await commentService.getCommentsForPost(req.user.id, req.params.postId);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json( result.data );
  } catch (err) {
    next(err);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const result = await commentService.updateComment(req.user.id, req.params.id, content);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json( result.data );
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const result = await commentService.deleteComment(req.user.id, req.params.id);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json( result.data );
  } catch (err) {
    next(err);
  }
};
