import * as postService from '../services/postService.js';
import { deriveMediaType } from '../middlewares/postUploads.js';

// ─── create ──────────────────────────────────────────────────────────────────

export const createPost = async (req, res, next) => {
  try {
    // Media is required — multer's fileFilter already restricts mimetypes,
    // but req.file being absent means no file was sent at all.
    if (!req.file) {
      return res.status(400).json({ message: 'Post media is required.' });
    }

    const mediaType = deriveMediaType(req.file.mimetype);
    const { caption } = req.body;

    const result = await postService.createPost(req.user.id, {
      caption,
      mediaUrl: req.file.path,
      mediaType,
    });

    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(201).json({ data: result.data });
  } catch (err) {
    next(err);
  }
};

// ─── feed ────────────────────────────────────────────────────────────────────

export const getFeed = async (req, res, next) => {
  try {
    const { page, pageSize } = req.query;
    const result = await postService.getFeed(req.user.id, { page, pageSize });
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json({ data: result.data });
  } catch (err) {
    next(err);
  }
};

// ─── single post ─────────────────────────────────────────────────────────────

export const getPostById = async (req, res, next) => {
  try {
    const result = await postService.getPostById(req.user.id, req.params.id);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json({ data: result.data });
  } catch (err) {
    next(err);
  }
};

// ─── update ──────────────────────────────────────────────────────────────────

export const updatePost = async (req, res, next) => {
  try {
    const { caption } = req.body;
    const result = await postService.updatePost(req.user.id, req.params.id, { caption });
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json({ data: result.data });
  } catch (err) {
    next(err);
  }
};

// ─── delete ──────────────────────────────────────────────────────────────────

export const deletePost = async (req, res, next) => {
  try {
    const result = await postService.deletePost(req.user.id, req.params.id);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};

// ─── a specific user's posts ───────────────────────────────────────────────────

export const getUserPosts = async (req, res, next) => {
  try {
    const { page, pageSize } = req.query;
    const result = await postService.getUserPosts(req.user.id, req.params.id, { page, pageSize });
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json({ data: result.data });
  } catch (err) {
    next(err);
  }
};

export const searchPosts = async (req, res, next) => {
  try {
    const { q, page, pageSize } = req.query;
    const result = await searchPostsService(req.user.id, { q, page, pageSize });
    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }
    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};