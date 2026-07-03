import jwt from "jsonwebtoken";
import env from "../config/env.js";
import crypto from "node:crypto";

const signToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

const generateToken = (expiresInHours) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  return { token, expiresAt };
};

const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

export {signToken, generateToken, verifyToken};