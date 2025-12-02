import type { MaybePromise, Server, ServerWebSocket } from "bun"
import { findUser } from "./user.ts";

interface WebSocketData {
    username: string,
}

enum MessageType {
    NEW_CHAT_ROOM,
    JOIN_CHAT_ROOM,
    SEND_MESSAGE,
}

const server: Server<WebSocketData> = Bun.serve({
    // @ts-ignore
    fetch(req: Request, server: Server<WebSocketData>): MaybePromise<Response> {
        const username = req.headers.get("X-Username")
        const password = req.headers.get("X-Password")
        if (username === null || password === null) return Response.json({ status: 400 })

        const user = findUser(username)
        if (user === undefined || user.password !== password) return Response.json({ status: 401 })

        const upgraded = server.upgrade(req, {
            data: {
                username,
            }
        })
        if (!upgraded) return Response.json({ status: 403 })
    },
    websocket: {
        data: {} as WebSocketData,
        open(ws: ServerWebSocket<WebSocketData>): void | Promise<void> {
            ws.send(`server> Welcome ${ws.data.username}`)
        },
        message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer<ArrayBuffer>): void | Promise<void> {
            console.log(`${ws.data.username}> ${message}`)
        },
        close(ws: ServerWebSocket<WebSocketData>, code: number, reason: string): void | Promise<void> {
        }
    },
})

console.log(`Server listening at ${server.url}`)