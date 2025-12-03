import { HttpStatusCode } from "./http-status-codes.ts"

class HttpError implements Bun.ErrorLike {
    readonly code?: string | undefined
    readonly errno?: number | undefined
    readonly syscall?: string | undefined
    readonly name: string
    readonly message: string
    readonly stack?: string | undefined
    readonly cause?: unknown

    constructor(name: string, message: string, httpStatusCode: number) {
        this.name = name
        this.message = message
        this.errno = httpStatusCode
    }
}

export class HttpBadRequestError extends HttpError {

    constructor(message: string) {
        super(HttpStatusCode.BAD_REQUEST.name, message, HttpStatusCode.BAD_REQUEST.code)
    }
}