import { UserAlreadyExistsError, UserNotFoundError } from "./error.ts"
import type { User } from "./types.ts"

const users: User[] = [
    {
        username: "test",
        password: "test"
    }
]

/**
 *
 * @param username
 * @throws UserNotFoundError
 */
export async function getUser(username: string): Promise<User> {
    for (let user of users) {
        if (username === user.username) {
            return user
        }
    }

    throw new UserNotFoundError(username)
}

/**
 *
 * @param username
 * @param password
 * @throws UserAlreadyExistsError
 */
export async function createUser(username: string, password: string): Promise<void> {
    for (let user of users) {
        if (username === user.username) {
            throw new UserAlreadyExistsError(username)
        }
    }

    users.push({ username, password})
}