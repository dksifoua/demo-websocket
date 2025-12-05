import { parseArgs } from "node:util"
import { HttpAuthRequestSchema, HttpAuthResponseSchema } from "@http/types.ts"

const AUTH_URL = "http://localhost:3000/auth"

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

const httpRequest = new Request(AUTH_URL, {
    method: "POST",
    body: JSON.stringify(HttpAuthRequestSchema.parse(values))
})
const httpResponse = await fetch(httpRequest)
if (httpResponse.status !== 200) {
    console.error(await httpResponse.json())
    process.exit(1)
}

const { token } = HttpAuthResponseSchema.parse(await httpResponse.json())
console.log(`Response code: ${httpResponse.status} - Access Token: ${token}`)