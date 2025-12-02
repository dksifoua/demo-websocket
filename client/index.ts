import { parseArgs } from "node:util"

const { values } = parseArgs({
    args: Bun.argv,
    options: {
        username: {
            type: "string",
            default: "username",
        },
        password: {
            type: "string",
            default: "password",
        },
    },
    strict: true,
    allowPositionals: true,
})

const username = values.username
const password = values.password

const ws = new WebSocket("ws://localhost:3000", {
    headers: {
        "X-Username": username,
        "X-Password": password,
    }
})

ws.addEventListener("open", event => {

})

ws.addEventListener("message", event => {
    console.log(event.data)
})

ws.addEventListener("close", event => {
    console.log("Connection closed!")
    process.exit()
})


for await (const line of console) {
    if (ws.readyState === 1) {
        ws.send(line)
    } else {
        ws.terminate()
        break
    }
}