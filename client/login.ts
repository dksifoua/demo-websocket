import { parseArgs } from "node:util"
import type { LoginResponse } from "../server/types.ts"

const LOGIN_URL = "http://localhost:3000/login"

const { values } = parseArgs({
    args: Bun.argv,
    options: {
        username: {
            type: "string",
            short: 'u'
        },
        password: {
            type: "string",
            short: 'p'
        },
    },
    strict: true,
    allowPositionals: true,
})

const username = values.username
const password = values.password

const httpRequest = new Request(LOGIN_URL, {
    method: "POST",
    body: JSON.stringify({ username, password })
})
const httpResponse = await fetch(httpRequest)
if (httpResponse.status !== 200) {
    console.error(await httpResponse.text())
    process.exit(1)
}

const { token } = await httpResponse.json() as LoginResponse
console.log(`Successfully logged to the chat server. Access Token: ${token}`)