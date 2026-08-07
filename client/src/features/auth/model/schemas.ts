import z from "zod";

export const registerSchema = z.object({
  email: z.email("email is required").trim(),
  password: z.string().min(5, "password is required").trim(),
  name: z.string("string is required").trim(),
});

export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email("email is required").trim(),
  password: z.string().min(5, "password is required").trim(),
});

export type LoginDto = z.infer<typeof loginSchema>
