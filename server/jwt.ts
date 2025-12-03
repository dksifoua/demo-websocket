import * as jose from "jose"

const secret = crypto.randomUUID().toString()

export function createAccessToken(): string {
    throw new Error("Not implemented yet!")
}

export function verifyAccessToken(): boolean {
    throw new Error("Not implemented yet!")
}

const alg = "HS256"
const jwtId = crypto.randomUUID().toString()
const jwt = await new jose.SignJWT({ "urn:example:claim": true })
    .setIssuer("auth.dksifoua.io")
    .setSubject("auth.dksifoua.io/test")
    .setAudience(["demo-websocket-chat-server", "demo-websocket-chat-client"])
    .setIssuedAt()
    .setExpirationTime("1h")
    .setJti(jwtId)
    .setProtectedHeader({ alg })
    .sign(new TextEncoder().encode(secret))

console.log({ jwtId, jwt, secret })

const { payload, protectedHeader } = await jose.jwtVerify(jwt, new TextEncoder().encode(secret), {
    issuer: "auth.dksifoua.io",
    audience: "demo-websocket-chat-server",
})
console.log({payload, protectedHeader})