import { parseArgs } from "node:util"
import { HttpLoginRequestSchema, HttpLoginResponseSchema } from "@http/types.ts"

const LOGIN_URL = "http://localhost:3000/login"

const { values } = parseArgs({
    args: Bun.argv,
    options: {
        username: {
            short: 'u',
            type: "string",
            default: "test"
        },
        password: {
            short: 'p',
            type: "string",
            default: "test"
        },
    },
    strict: true,
    allowPositionals: true,
})

const username = values.username
const password = values.password

const httpRequest = new Request(LOGIN_URL, {
    method: "POST",
    body: JSON.stringify(HttpLoginRequestSchema.parse({ username, password }))
})
const httpResponse = await fetch(httpRequest)
if (httpResponse.status !== 200) {
    console.error(`Error ${httpResponse.status}: ${await httpResponse.text()}`)
    process.exit(1)
}

const { token } = HttpLoginResponseSchema.parse(await httpResponse.json())
console.log(`Response code: ${httpResponse.status} - Access Token: ${token}`)