import { UserAlreadyExistsError, UserNotFoundError } from "@user/error.ts"
import { Auth } from "@/auth"
import { z } from "zod"
import {
    HttpAuthRequestSchema,
    type HttpAuthResponse,
    type HttpErrorResponse,
    HttpErrorResponseSchema
} from "@http/types.ts"
import {
    AuthInvalidCredentialError,
    AuthUserAlreadyAuthenticatedError,
    JwtInvalidAccessTokenError
} from "@auth/error.ts"
import { HttpStatusCode } from "@/http"
import type { Server, ServerWebSocket } from "bun"
import { jsonWebToken } from "@auth/jwt.ts"
import { ChatExchangeMessageSchema, ChatExchangeMessageTypeEnum } from "@/chat"

const ACCESS_SECRET: string = "a-string-secret-at-least-256-bits-long"
const HttpSessions: Map<string, string> = new Map()

type WebSocketServerData = {
    jwtId: string,
    username: string,
    createdAt: Date,
}
const webSocketSessions: Map<string, ServerWebSocket<WebSocketServerData>> = new Map()

const server: Server<WebSocketServerData> = Bun.serve({
    port: 3000,
    routes: {
        "/auth": {
            POST: async (request: Bun.BunRequest<"/auth">): Promise<Response> => {
                const { username, password, register } = HttpAuthRequestSchema.parse(await request.json())
                if (HttpSessions.has(username)) {
                    throw new AuthUserAlreadyAuthenticatedError(`${username} is already authenticated!`)
                }

                if (register) {
                    await Auth.register(username, password, ACCESS_SECRET)
                }
                const { jwtId, jwt } = await Auth.authenticate(username, password, ACCESS_SECRET)

                HttpSessions.set(username, jwtId)
                setTimeout(() => {
                    console.log(`[${new Date().toLocaleString()}] - The ${username} access token expired!`)
                    HttpSessions.delete(username)
                }, 1000 * 60 * 60)

                return Response.json({ token: jwt } as HttpAuthResponse, { status: 200 })
            }
        },
    },
    fetch: async (request: Bun.BunRequest, server: Server<WebSocketServerData>): Promise<Response> => {
        const url = new URL(request.url)
        if (url.pathname !== "/chat") return Response.json({
            name: HttpStatusCode.NOT_FOUND.name,
            message: "Resource not found!",
            errno: HttpStatusCode.NOT_FOUND.code
        } as HttpErrorResponse, { status: 404 })

        const jwt: string = request.headers.get("X-Access-Token") || ""
        const { jwtId, username } = await jsonWebToken.verify(jwt, ACCESS_SECRET)

        const upgraded = server.upgrade(request, {
            data: { jwtId, username, createdAt: new Date() }
        })
        if (!upgraded) throw new Error()

        return new Response(`Upgrade the Request to a ServerWebSocket`)
    },
    error(e: Bun.ErrorLike): Response {
        console.error(`[${new Date().toLocaleString()}] - ${e.message}`)

        switch (true) {
            case e instanceof z.ZodError:
                return Response.json({
                    name: HttpStatusCode.BAD_REQUEST.name,
                    message: `${z.prettifyError(e)}`,
                    errno: HttpStatusCode.BAD_REQUEST.code
                } as HttpErrorResponse, { status: HttpStatusCode.BAD_REQUEST.code })
            case e instanceof UserNotFoundError:
            case e instanceof UserAlreadyExistsError:
            case e instanceof AuthInvalidCredentialError:
            case e instanceof AuthUserAlreadyAuthenticatedError:
            case e instanceof JwtInvalidAccessTokenError:
                const { name, message, errno } = HttpErrorResponseSchema.parse(e)
                return Response.json({ name, message, errno }, { status: errno })

            default:
                return Response.json({
                    name: HttpStatusCode.INTERNAL_SERVER_ERROR.name,
                    message: "Something wrong happened on the server!",
                    errno: HttpStatusCode.INTERNAL_SERVER_ERROR.code
                } as HttpErrorResponse, { status: HttpStatusCode.INTERNAL_SERVER_ERROR.code })
        }
    },
    websocket: {
        data: {} as WebSocketServerData,
        open: async (ws: ServerWebSocket<WebSocketServerData>): Promise<void> => {
            webSocketSessions.set(ws.data.username, ws)
            ws.send(`server> Hello ${ws.data.username} from websocket!`)
        },
        message: async (ws: ServerWebSocket<WebSocketServerData>, message: string): Promise<void> => {
            const exchangeMessage = ChatExchangeMessageSchema.parse(JSON.parse(message))
            switch (true) {
                case exchangeMessage.command === ChatExchangeMessageTypeEnum.SHOW_CONNECTED_USERS:
                    ws.send(JSON.stringify(webSocketSessions.keys().toArray()))
                    break
                case exchangeMessage.command === ChatExchangeMessageTypeEnum.COUNT_CONNECTED_USERS:
                    ws.send(`There is/are ${webSocketSessions.size} user(s) connected!`)
                    break
                case exchangeMessage.command === ChatExchangeMessageTypeEnum.IS_CONNECTED_USER:
                    if (webSocketSessions.has(exchangeMessage.username)) {
                        ws.send(`The user ${exchangeMessage.username} is connected!`)
                    } else {
                        ws.send(`The user ${exchangeMessage.username} is not connected!`)
                    }
                    break
                case exchangeMessage.command === ChatExchangeMessageTypeEnum.DIRECT_MESSAGE:
                    const sws = webSocketSessions.get(exchangeMessage.username)
                    if (sws) {
                        sws.send(`${ws.data.username}> ${exchangeMessage.content}`)
                    } else {
                        ws.send(`The user ${webSocketSessions.has(exchangeMessage.username)} is not connected!`)
                    }
                    break
                default:
                    ws.send("Invalid command!")
            }

            console.log(`[${new Date().toLocaleString()}] - ${ws.data.username}> ${JSON.stringify(exchangeMessage)}`)
        }
    }
})

console.log(`[${new Date().toLocaleString()}] - Server listening at ${server.url}`)