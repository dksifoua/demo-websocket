import type { User } from "@user/types.ts"
import { userService } from "@user/user.service.ts"
import { jsonWebToken } from "@/auth/jwt.ts"
import { AuthInvalidCredentialError } from "@auth/error.ts"

type AuthResponse = { jwtId: string, jwt: string }

export const Auth = {
    /**
     *
     * @param username
     * @param password
     * @param secret
     * @throws AuthInvalidCredentialError
     * @Throws UserNotFoundError
     */
    async authenticate(username: string, password: string, secret: string): Promise<AuthResponse> {
        const user: User = await userService.getUser(username)
        if (user.password !== password) {
            throw new AuthInvalidCredentialError("Wrong password!")
        }
        const { jwtId, jwt } = await jsonWebToken.create(username, secret)

        return { jwtId, jwt }
    },

    /**
     *
     * @param username
     * @param password
     * @param secret
     * @throws AuthInvalidCredentialError
     * @Throws UserAlreadyExistsError
     */
    async register(username: string, password: string, secret: string): Promise<AuthResponse> {
        await userService.createUser(username, password)

        return Auth.authenticate(username, password, secret)
    },

    /**
     *
     * @param jwt
     * @param secret
     * @throws JwtInvalidAccessTokenError
     */
    async validate(jwt: string, secret: string): Promise<{ jwtId: string, username: string }> {
        return jsonWebToken.verify(jwt, secret)
    }
}