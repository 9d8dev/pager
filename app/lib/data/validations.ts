import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const signUpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const pageSchema = z.object({
  message: z.string().min(1),
  notif: z.boolean().optional(),
  discord: z.string().url().optional(),
  email: z.string().email().optional(),
  slack: z.string().url().optional(),
  webhook: z.string().url().optional(),
});
