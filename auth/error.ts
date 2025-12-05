import { GlobalError } from "@util/error.ts"
import { HttpStatusCode } from "@/http"

export class AuthInvalidCredentialError extends GlobalError {

    constructor(message: string) {
        super(HttpStatusCode.BAD_REQUEST.name, message, HttpStatusCode.BAD_REQUEST.code)
    }
}

export class AuthUserAlreadyAuthenticatedError extends GlobalError {

    constructor(message: string) {
        super(HttpStatusCode.FORBIDDEN.name, message, HttpStatusCode.FORBIDDEN.code)
    }
}

export class JwtInvalidAccessTokenError extends GlobalError {

    constructor(message: string) {
        super(HttpStatusCode.BAD_REQUEST.name, message, HttpStatusCode.BAD_REQUEST.code)
    }
}