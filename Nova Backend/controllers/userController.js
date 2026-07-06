import * as userService from '../services/userService.js';


export const getMe = async (req, res, next) => {
  try {
    const result = await userService.getOwnProfile(req.user.id);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json(result.data );
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const { name, bio } = req.body;
    const profilePicture = req.file ? req.file.path : undefined;

    const result = await userService.updateOwnProfile(req.user.id, { name, bio, profilePicture });
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const result = await userService.getPublicProfile(req.user.id, req.params.id);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};


export const followUser = async (req, res, next) => {
  try {
    const result = await userService.followUser(req.user.id, req.params.id);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(201).json(result.data);
  } catch (err) {
    next(err);
  }
};

export const unfollowUser = async (req, res, next) => {
  try {
    const result = await userService.unfollowUser(req.user.id, req.params.id);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};


export const blockUser = async (req, res, next) => {
  try {
    const result = await userService.blockUser(req.user.id, req.params.id);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(201).json(result.data);
  } catch (err) {
    next(err);
  }
};

export const unblockUser = async (req, res, next) => {
  try {
    const result = await userService.unblockUser(req.user.id, req.params.id);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};


export const getFollowers = async (req, res, next) => {
  try {
    const result = await userService.getFollowers(req.user.id, req.params.id);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};

export const getFollowing = async (req, res, next) => {
  try {
    const result = await userService.getFollowing(req.user.id, req.params.id);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};

export const deleteProfilePicture = async (req, res, next) => {
  try {
    const result = await userService.deleteProfilePicture(req.user.id);

    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const { q, page, pageSize } = req.query;
    const result = await userService.searchUsers(req.user.id, { q, page, pageSize });
    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }
    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};
