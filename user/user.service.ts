import type { User } from "@user/types.ts"
import { UserAlreadyExistsError, UserNotFoundError } from "@user/error.ts"

export class UserService {
    private readonly users: User[]

    constructor() {
        this.users = [{ username: "test", password: "test" }]
    }

    /**
     *
     * @param username
     * @param password
     * @throws UserAlreadyExistsError
     */
    async createUser(username: string, password: string): Promise<void> {
        for (const user of this.users) {
            if (user.username === username) {
                throw new UserAlreadyExistsError(username)
            }
        }

        this.users.push({ username, password })
    }

    /**
     *
     * @param username
     * @throws UserNotFoundError
     */
    async getUser(username: string): Promise<User> {
        for (const user of this.users) {
            if (user.username === username) {
                return user
            }
        }

        throw new UserNotFoundError(username)
    }
}

export const userService = new UserService()