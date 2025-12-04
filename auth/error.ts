import { GlobalError } from "@util/error.ts"
import { HttpStatusCode } from "@/http"

export class AuthenticationInvalidCredentialError extends GlobalError {

    constructor(message: string) {
        super(HttpStatusCode.BAD_REQUEST.name, message, HttpStatusCode.BAD_REQUEST.code)
    }
}