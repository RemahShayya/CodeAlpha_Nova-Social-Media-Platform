import * as authService from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register({ name, email, password });

    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const result = await authService.verifyEmail(token);

    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.resendVerificationEmail(email);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.query;
    const { newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);

    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
