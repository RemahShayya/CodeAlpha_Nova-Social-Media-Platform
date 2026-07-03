import { Router } from "express";
import {
  authenticate,
  requireRole,
} from "../middlewares/jwtAuthenticationMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  userIdParamSchema,
  postIdParamSchema,
  commentIdParamSchema,
} from "../validators/adminValidators.js";
import {deactivatedUsersSchema} from "../validators/deactivatedUsersSchema.js";
import { createAdmin } from "../controllers/adminController.js";
import {
  removeUser,
  restoreUser,
  removePost,
  removeComment,
  getDeactivatedUsers,
} from "../controllers/adminController.js";

const router = Router();

router.use(authenticate, requireRole("admin"));

router.post("/create-admin", createAdmin);

router.get('/users/deactivated', validate(deactivatedUsersSchema), getDeactivatedUsers);
router.delete("/users/:id", validate(userIdParamSchema), removeUser);
router.post("/users/:id/restore", validate(userIdParamSchema), restoreUser);

router.delete("/posts/:id", validate(postIdParamSchema), removePost);
router.delete("/comments/:id", validate(commentIdParamSchema), removeComment);



export default router;
