import { Router } from "express";
import {
  authenticate,
  requireRole,
} from "../middlewares/jwtAuthenticationMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { uploadProfilePicture } from "../middlewares/uploads.js";
import {
  updateProfileSchema,
  userIdParamSchema,
  searchUsersSchema,
} from "../validators/userValidators.js";
import { getUserPosts as getUserPostsController } from "../controllers/postController.js";
import { userPostsSchema } from "../validators/postValidators.js";

import {
  getMe,
  updateMe,
  getUserById,
  followUser,
  unfollowUser,
  blockUser,
  unblockUser,
  getFollowers,
  getFollowing,
  deleteProfilePicture,
  searchUsers,
} from "../controllers/userController.js";

const router = Router();

router.use(authenticate);

router.get("/me", getMe);
router.put(
  "/me",
  uploadProfilePicture,
  validate(updateProfileSchema),
  updateMe,
);
router.delete("/me/profile-picture", deleteProfilePicture);

router.get('/search', validate(searchUsersSchema), searchUsers);
router.get("/:id", validate(userIdParamSchema), getUserById);
router.get("/:id/followers", validate(userIdParamSchema), getFollowers);
router.get("/:id/following", validate(userIdParamSchema), getFollowing);

router.post(
  "/:id/follow",
  requireRole("user"),
  validate(userIdParamSchema),
  followUser,
);
router.delete(
  "/:id/follow",
  requireRole("user"),
  validate(userIdParamSchema),
  unfollowUser,
);
router.post(
  "/:id/block",
  requireRole("user"),
  validate(userIdParamSchema),
  blockUser,
);
router.delete(
  "/:id/block",
  requireRole("user"),
  validate(userIdParamSchema),
  unblockUser,
);
router.get("/:id/posts", validate(userPostsSchema), getUserPostsController);

export default router;
