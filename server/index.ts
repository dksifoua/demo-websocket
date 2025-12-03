import type { Nullable, User } from "../common/types.ts"
import { HttpBadRequestError, HttpInternalServerError, HttpNotFoundError } from "./error.ts"
import { HttpStatusCode } from "./http-status-codes.ts"
import { getUser } from "../common/user.ts"
import { UserNotFoundError } from "../common/error.ts"

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

                let user: Nullable<User> = null
                try {
                    user = await getUser(username)
                } catch (e) {
                    if (e instanceof UserNotFoundError) {
                        throw new HttpNotFoundError(e.message)
                    }
                    throw new HttpInternalServerError("Something wrong happened on the server!")
                }

                if (user && user.password !== password) {
                    await Bun.sleep(5000)
                    throw new HttpBadRequestError("Username or password doesn't match!")
                }

                return Response.json({ token: crypto.randomUUID() }, { status: 200 })
            }
        }
    },
    error(err) {
        console.error(err.message)

        switch (true) {
            case err instanceof HttpBadRequestError:
            case err instanceof HttpNotFoundError:
                return Response.json(err.message, { status: err.errno })

            default:
                return Response.json({ status: HttpStatusCode.INTERNAL_SERVER_ERROR.code })
        }


    }
})

console.log(`Server listening at ${server.url}`)