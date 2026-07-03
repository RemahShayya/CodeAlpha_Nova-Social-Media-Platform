import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/jwtAuthenticationMiddleware.js';
import { validate } from '../middlewares/validate.js';
import {
  createCommentSchema,
  listCommentsSchema,
  updateCommentSchema,
  commentIdParamSchema,
} from '../validators/commentValidators.js';
import {
  createComment,
  getCommentsForPost,
  updateComment,
  deleteComment,
} from '../controllers/commentController.js';


const postCommentsRouter = Router({ mergeParams: true });
postCommentsRouter.use(authenticate);

postCommentsRouter.post('/', requireRole('user'), validate(createCommentSchema), createComment);
postCommentsRouter.get('/', validate(listCommentsSchema), getCommentsForPost);

const commentRouter = Router();
commentRouter.use(authenticate);

commentRouter.put('/:id', requireRole('user'), validate(updateCommentSchema), updateComment);
commentRouter.delete('/:id', requireRole('user'), validate(commentIdParamSchema), deleteComment);

export { postCommentsRouter, commentRouter };
