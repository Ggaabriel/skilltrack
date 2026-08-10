import z from "zod";

export const userSchema = z.object({
  id: z.number(),
  email: z.email().trim(),
  name: z.string().trim(),
  picturePath: z.string().trim().nullable()
})

export type UserDto = z.infer<typeof userSchema>