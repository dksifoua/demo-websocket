export class GlobalError implements Bun.ErrorLike {
    readonly code?: string | undefined
    readonly errno?: number | undefined
    readonly syscall?: string | undefined
    readonly name: string
    readonly message: string
    readonly stack?: string | undefined
    readonly cause?: unknown

    constructor(name: string, message: string, errno: number) {
        this.name = name
        this.message = message
        this.errno = errno
    }
}