import { parseArgs } from "node:util"
import { z } from "zod"

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

ws.addEventListener("close", event => {
    console.log(`[${new Date().toLocaleString()}] - Connection closed!`)
    process.exit()
})
//
//
// for await (const line of console) {
//     if (ws.readyState === 1) {
//         ws.send(line)
//     } else {
//         ws.terminate()
//         break
//     }
// }