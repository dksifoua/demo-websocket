import { z } from "zod"

export const HttpLoginRequestSchema = z.object({
    username: z.string().min(3).max(8),
    password: z.string().min(3).max(8),
})
export type HttpLoginRequest = z.infer<typeof HttpLoginRequestSchema>

export const HttpLoginResponseSchema = z.object({
    token: z.jwt()
})
export type HttpLoginResponse = z.infer<typeof HttpLoginResponseSchema>