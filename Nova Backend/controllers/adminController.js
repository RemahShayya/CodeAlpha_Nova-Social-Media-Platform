import * as adminService from '../services/adminService.js';

export const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await adminService.createAdmin({ name, email, password });

    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const removeUser = async (req, res, next) => {
  try {
    const result = await adminService.removeUser(req.params.id);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};

export const restoreUser = async (req, res, next) => {
  try {
    const result = await adminService.restoreUser(req.params.id);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};

export const removePost = async (req, res, next) => {
  try {
    const result = await adminService.removePost(req.params.id);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};

export const removeComment = async (req, res, next) => {
  try {
    const result = await adminService.removeComment(req.params.id);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};

export const getDeactivatedUsers = async (req, res, next) => {
  try {
    const { q, page, pageSize } = req.query;
    const result = await adminService.getDeactivatedUsers({ q, page, pageSize });
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json(result.data);
  } catch (err) {
    next(err);
  }
};