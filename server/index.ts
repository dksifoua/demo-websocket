import type { User } from "../common/types.ts"
import { HttpBadRequestError } from "./error.ts"
import { HttpStatusCode } from "./http-status-codes.ts"

const server = Bun.serve({
    port: 3000,
    routes: {
        "/login": {
            POST: async (req) => {
                const requestBody = await req.json()
                const { username, password } = requestBody as User

                if (!username || !password) {
                    throw new HttpBadRequestError("Username and password required!")
                }

                return Response.json({ token: crypto.randomUUID() }, { status: 200 })
            }
        }
    },
    error(err) {
        console.error(err.message)

        switch (true) {
            case err instanceof HttpBadRequestError:
                return Response.json(err.message, { status: err.errno })

            default:
                return Response.json({ status: HttpStatusCode.BAD_REQUEST.code })
        }


    }
})

console.log(`Server listening at ${server.url}`)