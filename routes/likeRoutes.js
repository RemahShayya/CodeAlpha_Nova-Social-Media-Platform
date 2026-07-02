import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/jwtAuthenticationMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { postIdParamSchema } from '../validators/likeValidators.js';
import { likePost, unlikePost, getLikesForPost } from '../controllers/likeController.js';

// Mounted at /api/posts/:postId/... — needs mergeParams since postId comes
// from the parent router's path segment, not this router's own.
const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/like', requireRole('user'), validate(postIdParamSchema), likePost);
router.delete('/like', requireRole('user'), validate(postIdParamSchema), unlikePost);
router.get('/likes', validate(postIdParamSchema), getLikesForPost);

export default router;
