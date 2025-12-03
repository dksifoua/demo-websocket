import * as jose from "jose"
import type { Nullable } from "../types.ts"
import { HttpUnauthorizedError } from "../http/error.ts"

export class JsonWebToken {
    static readonly ISSUER: string = "auth.dksifoua.io"
    static readonly AUDIENCE: string[] = ["demo-websocket-chat-server"]

    readonly encoder: TextEncoder

    constructor() {
        this.encoder = new TextEncoder()
    }

    async create(jwtId: string, username: string, secret: string): Promise<string> {
        const alg = "HS256"
        const subject: string = [JsonWebToken.ISSUER, username].join('/')
        return new jose.SignJWT()
            .setIssuer(JsonWebToken.ISSUER)
            .setSubject(subject)
            .setAudience(JsonWebToken.AUDIENCE)
            .setIssuedAt()
            .setExpirationTime("1h")
            .setJti(jwtId)
            .setProtectedHeader({ alg })
            .sign(this.encoder.encode(secret))
    }

    async verify(jwtId : string, jwt: string, secret: string): Promise<{username: string}> {
        let payload: Nullable<jose.JWTPayload> = null
        try {
            ({ payload } = await jose.jwtVerify(jwt, this.encoder.encode(secret), {
                issuer: JsonWebToken.ISSUER,
                audience: JsonWebToken.AUDIENCE,
            }))
        } catch (e) {
            throw new HttpUnauthorizedError("Invalid Access Token!")
        }

        if (payload && payload.jti === jwtId && payload.sub) {
            const username: string = payload.sub
            return { username }
        }

        throw new HttpUnauthorizedError("Invalid Access Token!")
    }
}

export const jsonWebToken = new JsonWebToken()