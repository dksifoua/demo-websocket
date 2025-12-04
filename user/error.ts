import { GlobalError } from "@util/error.ts"
import { HttpStatusCode } from "@/http"


export class UserNotFoundError extends GlobalError {

    constructor(username: string) {
        super(HttpStatusCode.NOT_FOUND.name, `${username} not found!`, HttpStatusCode.NOT_FOUND.code)
    }
}

export class UserAlreadyExistsError extends GlobalError {

    constructor(username: string) {
        super(HttpStatusCode.BAD_REQUEST.name, `${username} already exists!`, HttpStatusCode.BAD_REQUEST.code)
    }
}