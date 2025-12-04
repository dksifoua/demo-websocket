import { parseArgs } from "node:util"
import { HttpAuthRequestSchema, HttpAuthResponseSchema } from "@http/types.ts"

const BASE_URL = "http://localhost:3000/"

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
        register: {
            short: 'r',
            type: "boolean",
            default: false
        },
    },
    strict: true,
    allowPositionals: true,
})

const { username, password, register } = values

const httpRequest = new Request(register ? `${BASE_URL}/register` : `${BASE_URL}/login`, {
    method: "POST",
    body: JSON.stringify(HttpAuthRequestSchema.parse({ username, password }))
})
const httpResponse = await fetch(httpRequest)
if (httpResponse.status !== 200) {
    console.error(`Error ${httpResponse.status}: ${await httpResponse.text()}`)
    process.exit(1)
}

const { token } = HttpAuthResponseSchema.parse(await httpResponse.json())
console.log(`Response code: ${httpResponse.status} - Access Token: ${token}`)