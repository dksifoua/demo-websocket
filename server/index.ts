import { HttpBadRequestError, HttpInternalServerError, HttpNotFoundError, HttpUnauthorizedError } from "@http/error.ts"
import { UserAlreadyExistsError, UserNotFoundError } from "@user/error.ts"
import { Auth, AuthenticationInvalidCredentialError } from "@/auth"
import { z } from "zod"
import { HttpStatusCode } from "@/http"
import { HttpAuthRequestSchema, type HttpAuthResponse } from "@http/types.ts"

const sessions: Map<string, string> = new Map()

const server = Bun.serve({
    port: 3000,
    routes: {
        "/auth": {
            POST: async (request: Bun.BunRequest<"/auth">): Promise<Response> => {
                try {
                    const { username, password, register } = HttpAuthRequestSchema.parse(await request.json())

                    if (register) await Auth.register(username, password)
                    const { jwtId, jwt } = await Auth.authenticate(username, password)

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
        console.error(`${new Date().toLocaleString()} - ${err.message}`)

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