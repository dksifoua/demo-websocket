import * as jose from "jose"
import type { Nullable } from "@/types.ts"
import { JwtInvalidAccessTokenError } from "@auth/error.ts"

export class JsonWebToken {
    static readonly ISSUER: string = "auth.dksifoua.io"
    static readonly AUDIENCE: string[] = ["demo-websocket-chat-server"]

    readonly encoder: TextEncoder

    constructor() {
        this.encoder = new TextEncoder()
    }

    async create(username: string, secret: string): Promise<{ jwtId: string, jwt: string }> {
        const alg = "HS256"
        const subject: string = [JsonWebToken.ISSUER, username].join('/')
        const jwtId = crypto.randomUUID().toString()
        const signedJwt = new jose.SignJWT()
            .setIssuer(JsonWebToken.ISSUER)
            .setSubject(subject)
            .setAudience(JsonWebToken.AUDIENCE)
            .setIssuedAt()
            .setExpirationTime("1h")
            .setJti(jwtId)
            .setProtectedHeader({ alg })

        const jwt = await signedJwt.sign(this.encoder.encode(secret))

        return { jwtId, jwt }
    }

    /**
     *
     * @param jwt
     * @param secret
     * @throws JwtInvalidAccessTokenError
     */
    async verify(jwt: string, secret: string): Promise<{ jwtId: string, username: string }> {
        let payload: Nullable<jose.JWTPayload> = null
        try {
            ({ payload } = await jose.jwtVerify(jwt, this.encoder.encode(secret), {
                issuer: JsonWebToken.ISSUER,
                audience: JsonWebToken.AUDIENCE,
            }))
        } catch (e) {
            throw new JwtInvalidAccessTokenError("Invalid Access Token!")
        }

        if (payload && payload.jti && payload.sub) {
            return { jwtId: payload.jti, username: payload.sub }
        }

        throw new JwtInvalidAccessTokenError("Invalid Access Token!")
    }
}

export const jsonWebToken = new JsonWebToken()