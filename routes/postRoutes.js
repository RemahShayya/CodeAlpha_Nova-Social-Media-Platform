import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/jwtAuthenticationMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { uploadPostMedia } from '../middlewares/postUploads.js';
import {
  createPostSchema, updatePostSchema, postIdParamSchema, feedQuerySchema, searchPostsSchema,
} from '../validators/postValidators.js';
import {
  createPost, getFeed, getPostById, updatePost, deletePost, searchPosts,
} from '../controllers/postController.js';

const router = Router();

router.use(authenticate);

router.post('/', requireRole('user'), uploadPostMedia, validate(createPostSchema), createPost);
router.get('/', validate(feedQuerySchema), getFeed);
router.get('/search', validate(searchPostsSchema), searchPosts);
router.get('/:id', validate(postIdParamSchema), getPostById);
router.put('/:id', requireRole('user'), validate(updatePostSchema), updatePost);
router.delete('/:id', requireRole('user'), validate(postIdParamSchema), deletePost);

export default router;