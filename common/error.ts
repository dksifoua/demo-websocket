class UserError extends Error {
    readonly username: string

    constructor(username: string, message: string) {
        super(message)

        this.username = username
    }
}

export class UserNotFoundError extends UserError {

    constructor(username: string) {
        super(username, `${username} not found!`)
    }
}

export class UserAlreadyExistsError extends UserError {

    constructor(username: string) {
        super(username, `${username} not found!`)
    }
}