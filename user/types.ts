import * as z from "zod"

export const UserSchema = z.object({
    username: z.string().min(3).max(8),
    password: z.string().min(3).max(8),
})
export type User = z.infer<typeof UserSchema>