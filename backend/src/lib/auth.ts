import { hash, compare } from 'bcrypt';
import { SignJWT, jwtVerify } from 'jose';
import { Context } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const COOKIE_NAME = 'auth_token';

export async function hashPassword(password: string): Promise<string> {
    return await hash(password, 10);
}

export async function comparePassword(
    password: string,
    hashed: string,
): Promise<boolean> {
    return await compare(password, hashed);
}

export async function createToken(userId: string): Promise<string> {
    return await new SignJWT({ userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(userId)
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);

        if (payload.sub) {
            return { userId: payload.sub };
        }
        return null;
    } catch (error) {
        return null;
    }
}

export function setAuthCookie(c: Context, token: string): void {
    setCookie(c, COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
    });
}

export function clearAuthCookie(c: Context): void {
    deleteCookie(c, COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
    });
}