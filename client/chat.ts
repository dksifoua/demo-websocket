// noinspection ExceptionCaughtLocallyJS

import { parseArgs } from "node:util"
import { z } from "zod"
import { type ChatExchangeMessage, ChatExchangeMessageSchema, ChatExchangeMessageTypeSchema } from "@/chat"
import type { Nullable } from "@/types.ts"

const WEB_SOCKET_URL = "ws://localhost:3000/ws"

const { values } = parseArgs({
    args: Bun.argv,
    options: {
        token: {
            short: 't',
            type: "string"
        },
    },
    strict: true,
    allowPositionals: true,
})

const ws = new WebSocket("ws://localhost:3000/chat", {
    headers: {
        "X-Access-Token": z.string().parse(values.token)
    }
})

ws.addEventListener("open", event => {
    console.log(`[${new Date().toLocaleString()}] - Connected to websocket chat server`)
})

ws.addEventListener("message", event => {
    console.log(`[${new Date().toLocaleString()}] - ${event.data}`)
})

ws.addEventListener("close", (event: CloseEvent) => {
    console.log(`[${new Date().toLocaleString()}] - Connection closed!`)
    process.exit()
})

for await (const line of console) {
    if (ws.readyState !== 1) {
        ws.terminate()
        break
    }

    try {
        const lineParts = z.array(z.string()).min(1).parse(line.split(" -- "))
        const command = ChatExchangeMessageTypeSchema.parse(lineParts[0])

        let exchangeMessage: Nullable<ChatExchangeMessage> = null
        switch (true) {
            case lineParts.length === 1:
                exchangeMessage = ChatExchangeMessageSchema.parse({ command })
                break
            case lineParts.length === 2:
                exchangeMessage = ChatExchangeMessageSchema.parse({ command, username: lineParts[1] })
                break
            case lineParts.length === 3:
                exchangeMessage = ChatExchangeMessageSchema.parse({ command, username: lineParts[1], content: lineParts[2] })
                break
            default:
                throw new Error()
        }

        ws.send(JSON.stringify(exchangeMessage))
    } catch (e) {
        if (e instanceof z.ZodError) {
            console.error(`[${new Date().toLocaleString()}] - ${z.prettifyError(e)}`)
        } else {
            console.error(`[${new Date().toLocaleString()}] - Invalid input!`)
        }
    }
}