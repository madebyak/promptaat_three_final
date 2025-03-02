import * as jose from 'jose'

const JWT_SECRET = process.env.JWT_SECRET!

interface TokenPayload {
  userId: string
  email: string
  [key: string]: string | number | boolean | null
}

export async function generateToken(payload: TokenPayload): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jose.jwtVerify(token, secret);
  return payload as unknown as TokenPayload;
}

export async function decodeToken(token: string): Promise<TokenPayload | null> {
  try {
    return jose.decodeJwt(token) as TokenPayload;
  } catch {
    return null;
  }
}
