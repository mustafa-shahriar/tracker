import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

import { db } from "../../db/db.ts";
import { refreshTokensTable, usersTable } from "../../db/schema.ts";
import { jwtSecret } from "../../config.ts";
import type { LoginInput, RegisterInput } from "./auth.validation.ts";
import { eq, and } from "drizzle-orm";


export async function createUser(userData: RegisterInput) {
    const hashPass = await argon2.hash(userData.password);

    const result = await db
        .insert(usersTable)
        .values({
            name: userData.name,
            email: userData.email,
            passwordHash: hashPass,
        })
        .returning();

    const { passwordHash, ...safeUser } = result[0]!;
    return safeUser;
}

export async function getUser(payload: LoginInput) {
    const hashPass = await argon2.hash(payload.password);
    const [user] = await db.select().from(usersTable).where(and(
        eq(usersTable.email, payload.email),
        eq(usersTable.passwordHash, hashPass)
    ))

    if (!user) {
        throw new Error("Invalid credential")
    }

    return user;
}

type TokenPayload = {
    userId: number;
};

export function generateJwt(payload: TokenPayload) {
    return jwt.sign(payload, jwtSecret!, {
        expiresIn: "15m",
    });
}

export function generateRawRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
}

export function hashRefreshToken(token: string) {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}


export async function createRefreshToken(userId: number) {
    const rawToken = generateRawRefreshToken();
    const tokenHash = hashRefreshToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await db.insert(refreshTokensTable).values({
        userId,
        tokenHash,
        expiresAt,
    });

    return rawToken;
}

export async function verifyRefreshToken(rawToken: string) {
    const tokenHash = hashRefreshToken(rawToken);

    const [token] = await db
        .select()
        .from(refreshTokensTable)
        .where(eq(refreshTokensTable.tokenHash, tokenHash));

    if (!token) return null;

    if (token.expiresAt < new Date()) {
        await db
            .delete(refreshTokensTable)
            .where(eq(refreshTokensTable.id, token.id));
        return null;
    };

    return token;
}

export async function deleteRefreshToken(rawToken: string) {
    const tokenHash = hashRefreshToken(rawToken);

    await db
        .delete(refreshTokensTable)
        .where(eq(refreshTokensTable.tokenHash, tokenHash));
}
