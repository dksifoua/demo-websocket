export interface User {
    username: string,
    password: string,
}

const users: User[] = [
    {
        username: "dimitri",
        password: "dimitri",
    },
    {
        username: "elsa",
        password: "elsa",
    },
]

export function findUser(username: string): User | undefined {
    for (let user of users) {
        if (user.username === username) {
            return user
        }
    }


    return undefined
}