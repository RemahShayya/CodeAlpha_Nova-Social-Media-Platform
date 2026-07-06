import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const verifyEmailSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({ token: z.string().min(1, { message: "Token is required" }) }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const forgotPasswordSchema = z.object({
  body: z.object({ email: z.string().email({ message: "Invalid email address" }) }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  }),
  params: z.object({}).optional(),
  query: z.object({ token: z.string().min(1, { message: "Token is required" }) }),
});