import { UserAlreadyExistsError, UserNotFoundError } from "@user/error.ts"
import { Auth } from "@/auth"
import { z } from "zod"
import {
    HttpAuthRequestSchema,
    type HttpAuthResponse,
    type HttpErrorResponse,
    HttpErrorResponseSchema
} from "@http/types.ts"
import { AuthenticationInvalidCredentialError } from "@auth/error.ts"
import { HttpStatusCode } from "@/http"

const sessions: Map<string, string> = new Map()

const server = Bun.serve({
    port: 3000,
    routes: {
        "/auth": {
            POST: async (request: Bun.BunRequest<"/auth">): Promise<Response> => {
                const { username, password, register } = HttpAuthRequestSchema.parse(await request.json())

                if (register) await Auth.register(username, password)
                const { jwtId, jwt } = await Auth.authenticate(username, password)

                sessions.set(username, jwtId)

                return Response.json({ token: jwt } as HttpAuthResponse, { status: 200 })
            }
        }
    },
    error(e: Bun.ErrorLike): Response {
        console.error(`${new Date().toLocaleString()} - ${e.message}`)

        switch (true) {
            case e instanceof z.ZodError:
                return Response.json({
                    name: HttpStatusCode.BAD_REQUEST.name,
                    message: "Request parsing error!",
                    errno: HttpStatusCode.BAD_REQUEST.code
                } as HttpErrorResponse, { status: HttpStatusCode.BAD_REQUEST.code })
            case e instanceof UserNotFoundError:
            case e instanceof UserAlreadyExistsError:
            case e instanceof AuthenticationInvalidCredentialError:
                const { name, message, errno } = HttpErrorResponseSchema.parse(e)
                return Response.json({ name, message, errno }, { status: errno })

            default:
                return Response.json({
                    name: HttpStatusCode.INTERNAL_SERVER_ERROR.name,
                    message: "Something wrong happened on the server!",
                    errno: HttpStatusCode.INTERNAL_SERVER_ERROR.code
                } as HttpErrorResponse, { status: HttpStatusCode.INTERNAL_SERVER_ERROR.code })
        }
    }
})

console.log(`Server listening at ${server.url}`)