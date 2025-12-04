import type { User } from "@user/types.ts"
import { userService } from "@user/user.service.ts"
import { jsonWebToken } from "@/auth/jwt.ts"

const SECRET: string = crypto.randomUUID().toString()

export class AuthenticationInvalidCredentialError extends Error {

    constructor(message: string) {
        super(message)
    }
}

type AuthResponse = { jwtId: string, jwt: string }

/**
 *
 * @param username
 * @param password
 * @throws AuthenticationInvalidCredentialError
 * @Throws UserNotFoundError
 */
export async function authenticate(username: string, password: string): Promise<AuthResponse> {
    const user: User = await userService.getUser(username)
    if (user.password !== password) {
        throw new AuthenticationInvalidCredentialError("Wrong password!")
    }

    const jwtId: string = crypto.randomUUID().toString()
    const jwt: string = await jsonWebToken.create(jwtId, username, SECRET)

    return { jwtId, jwt }
}


/**
 *
 * @param username
 * @param password
 * @throws AuthenticationInvalidCredentialError
 * @Throws UserAlreadyExistsError
 */
export async function register(username: string, password: string): Promise<AuthResponse> {
    await userService.createUser(username, password)

    return authenticate(username, password)
}