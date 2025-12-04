import { HttpBadRequestError, HttpInternalServerError, HttpNotFoundError, HttpUnauthorizedError } from "@http/error.ts"
import { UserAlreadyExistsError, UserNotFoundError } from "@user/error.ts"
import { authenticate, AuthenticationInvalidCredentialError, register } from "@/auth"
import { z } from "zod"
import { HttpStatusCode } from "@/http"
import { HttpAuthRequestSchema, type HttpAuthResponse } from "@http/types.ts"

const sessions: Map<string, string> = new Map()

const server = Bun.serve({
    port: 3000,
    routes: {
        "/login": {
            POST: async (req) => {
                const requestBody = await req.json()

                try {
                    const { username, password } = HttpAuthRequestSchema.parse(requestBody)

                    const { jwtId, jwt } = await authenticate(username, password)
                    sessions.set(username, jwtId)

                    return Response.json({ token: jwt } as HttpAuthResponse, { status: 200 })
                } catch (e) {
                    await Bun.sleep(2500)

                    if (e instanceof z.ZodError) throw new HttpBadRequestError("Username and password required!")
                    if (e instanceof UserNotFoundError) throw new HttpNotFoundError(e.message)
                    if (e instanceof AuthenticationInvalidCredentialError) throw new HttpUnauthorizedError(e.message)

                    throw new HttpInternalServerError("Something wrong happened on the server!")
                }
            }
        },
        "/register": {
            POST: async (req) => {
                const requestBody = await req.json()

                try {
                    const { username, password } = HttpAuthRequestSchema.parse(requestBody)
                    await register(username, password)

                    const { jwtId, jwt } = await authenticate(username, password)
                    sessions.set(username, jwtId)

                    return Response.json({ token: jwt } as HttpAuthResponse, { status: 200 })
                } catch (e) {
                    await Bun.sleep(2500)

                    if (e instanceof z.ZodError) throw new HttpBadRequestError("Username and password required!")
                    if (e instanceof UserNotFoundError) throw new HttpNotFoundError(e.message)
                    if (e instanceof UserAlreadyExistsError) throw new HttpBadRequestError(e.message)
                    if (e instanceof AuthenticationInvalidCredentialError) throw new HttpUnauthorizedError(e.message)

                    throw new HttpInternalServerError("Something wrong happened on the server!")
                }
            }
        }
    },
    error(err) {
        console.error(err.message)

        switch (true) {
            case err instanceof HttpBadRequestError:
            case err instanceof HttpNotFoundError:
            case err instanceof HttpUnauthorizedError:
                return Response.json(err.message, { status: err.errno })

            default:
                return Response.json({ status: HttpStatusCode.INTERNAL_SERVER_ERROR.code })
        }
    }
})

console.log(`Server listening at ${server.url}`)