import type { User } from "@user/types.ts"
import { userService } from "@user/user.service.ts"
import { jsonWebToken } from "@/auth/jwt.ts"
import { AuthenticationInvalidCredentialError } from "@auth/error.ts"

const SECRET: string = crypto.randomUUID().toString()


type AuthResponse = { jwtId: string, jwt: string }

export const Auth = {
    /**
     *
     * @param username
     * @param password
     * @throws AuthenticationInvalidCredentialError
     * @Throws UserNotFoundError
     */
    async authenticate(username: string, password: string): Promise<AuthResponse> {
        const user: User = await userService.getUser(username)
        if (user.password !== password) {
            throw new AuthenticationInvalidCredentialError("Wrong password!")
        }

        const jwtId: string = crypto.randomUUID().toString()
        const jwt: string = await jsonWebToken.create(jwtId, username, SECRET)

        return { jwtId, jwt }
    },

    /**
     *
     * @param username
     * @param password
     * @throws AuthenticationInvalidCredentialError
     * @Throws UserAlreadyExistsError
     */
    async register(username: string, password: string): Promise<AuthResponse> {
        await userService.createUser(username, password)

        return Auth.authenticate(username, password)
    }
}