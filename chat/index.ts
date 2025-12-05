import { z } from "zod"

export enum ChatExchangeMessageTypeEnum {
    DIRECT_MESSAGE = "dm",
    SHOW_CONNECTED_USERS = "scu",
    COUNT_CONNECTED_USERS = "ccu",
    IS_CONNECTED_USER = "icu"
}

export const ChatExchangeMessageTypeSchema = z.enum(ChatExchangeMessageTypeEnum)
// export type ChatExchangeMessageType = z.infer<typeof ChatExchangeMessageTypeSchema>

export const ChatExchangeMessageSchema = z.discriminatedUnion("command", [
    z.object({
        command: z.literal(ChatExchangeMessageTypeEnum.DIRECT_MESSAGE),
        username: z.string(),
        content: z.string(),
    }),
    z.object({
        command: z.union([
            z.literal(ChatExchangeMessageTypeEnum.SHOW_CONNECTED_USERS),
            z.literal(ChatExchangeMessageTypeEnum.COUNT_CONNECTED_USERS)
        ]),
    }),
    z.object({
        command: z.literal(ChatExchangeMessageTypeEnum.IS_CONNECTED_USER),
        username: z.string()
    })
])
export type ChatExchangeMessage = z.infer<typeof ChatExchangeMessageSchema>