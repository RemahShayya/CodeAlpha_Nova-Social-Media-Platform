import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import env from "../config/env.js";
import models from "../models/index.js";
import sanitizeUser from "../utiles/sanitizeUser.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./emailService.js";
import { signToken, generateToken } from "./jwtService.js";

const saltRounds = env.SALT_ROUNDS;
const verificationTokenExpiresHours = env.VERIFICATION_TOKEN_EXPIRES_HOURS;
const resetTokenExpiresHours = env.RESET_TOKEN_EXPIRES_HOURS;

export const register = async ({ name, email, password }) => {
  const existing = await models.User.findOne({ where: { email } });
  if (existing) {
    return { error: "Email already in use", status: 409 };
  }

  const passwordHash = await bcrypt.hash(password, saltRounds);
  const {
    token: emailVerificationToken,
    expiresAt: emailVerificationTokenExpiresAt,
  } = generateToken(verificationTokenExpiresHours);

  await models.User.create({
    name,
    email,
    passwordHash,
    emailVerificationToken,
    emailVerificationTokenExpiresAt,
  });

  await sendVerificationEmail(email, name, emailVerificationToken);

  return {
    message:
      "Registration successful. Please check your email to verify your account.",
  };
};

export const verifyEmail = async (token) => {
  const user = await models.User.findOne({
    where: { emailVerificationToken: token },
  });

  if (!user) {
    return { error: "Invalid verification token", status: 400 };
  }

  if (new Date() > user.emailVerificationTokenExpiresAt) {
    return { error: "Verification token has expired", status: 400 };
  }

  await user.update({
    isEmailVerified: true,
    emailVerificationToken: null,
    emailVerificationTokenExpiresAt: null,
  });

  return { message: "Email verified successfully. You can now log in." };
};

export const resendVerificationEmail = async (email) => {
  const user = await models.User.findOne({ where: { email } });

  if (!user || user.isEmailVerified) {
    return {
      message:
        "If that email exists and is unverified, a new link has been sent.",
    };
  }

  const {
    token: emailVerificationToken,
    expiresAt: emailVerificationTokenExpiresAt,
  } = generateToken(verificationTokenExpiresHours);

  await user.update({
    emailVerificationToken,
    emailVerificationTokenExpiresAt,
  });
  await sendVerificationEmail(email, user.name, emailVerificationToken);

  return {
    message:
      "If that email exists and is unverified, a new link has been sent.",
  };
};

export const login = async ({ email, password }) => {
  const user = await models.User.findOne({
    where: { email },
    paranoid: false,
  });
  if (!user) {
    return { error: "Invalid credentials.", status: 401 };
  }

  if (user.deletedAt) {
    return { error: "Invalid credentials.", status: 401 };
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    return { error: "Invalid credentials.", status: 401 };
  }

  if (!user.isEmailVerified) {
    return { error: "Please verify your email before logging in", status: 403 };
  }

  const token = signToken(user);
  return { user: sanitizeUser(user), token };
};

export const forgotPassword = async (email) => {
  const user = await models.User.findOne({ where: { email } });

  if (!user) {
    return {
      message:
        "If that email is registered, a password reset link has been sent.",
    };
  }

  const { token: passwordResetToken, expiresAt: passwordResetTokenExpiresAt } =
    generateToken(resetTokenExpiresHours);

  await user.update({ passwordResetToken, passwordResetTokenExpiresAt });
  await sendPasswordResetEmail(email, user.name, passwordResetToken);

  return {
    message:
      "If that email is registered, a password reset link has been sent.",
  };
};

export const resetPassword = async (token, newPassword) => {
  const user = await models.User.findOne({
    where: { passwordResetToken: token },
  });

  if (!user) {
    return { error: "Invalid or expired reset token", status: 400 };
  }

  if (new Date() > user.passwordResetTokenExpiresAt) {
    return { error: "Invalid or expired reset token", status: 400 };
  }

  const passwordHash = await bcrypt.hash(newPassword, saltRounds);

  await user.update({
    passwordHash,
    passwordResetToken: null,
    passwordResetTokenExpiresAt: null,
  });

  return { message: "Password reset successful. You can now log in." };
};
