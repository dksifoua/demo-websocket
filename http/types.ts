import { z } from "zod"

export const HttpAuthRequestSchema = z.object({
    username: z.string().min(3).max(8),
    password: z.string().min(3).max(8),
    register: z.boolean().default(false)
})
export type HttpAuthRequest = z.infer<typeof HttpAuthRequestSchema>

export const HttpAuthResponseSchema = z.object({
    token: z.jwt()
})
export type HttpAuthResponse = z.infer<typeof HttpAuthResponseSchema>