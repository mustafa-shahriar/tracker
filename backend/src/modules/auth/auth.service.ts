import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

import { db } from "../../db/db.ts";
import { refreshTokensTable, usersTable, userStatTable } from "../../db/schema.ts";
import { JWT_SECRET } from "../../config.ts";
import type { LoginInput, RegisterInput } from "./auth.validation.ts";
import { eq } from "drizzle-orm";
import type { AuthUser } from "../../types/auth.ts";

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

export async function createUserStat(user_id: number) {
    const passKey = crypto.randomBytes(20).toString("hex");

    const [result] = await db
        .insert(userStatTable)
        .values({
            user_id,
            passKey,
        })
        .returning();

    return result;
}

export async function getUser(payload: LoginInput) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, payload.email));
    if (!user) {
        throw new Error("Invalid credential");
    }

    const isValidPass = await argon2.verify(user.passwordHash, payload.password);
    if (!isValidPass) {
        throw new Error("Invalid credential");
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
}

export function generateJwt(payload: AuthUser) {
    return jwt.sign(payload, JWT_SECRET!, {
        expiresIn: "15m",
    });
}

export function generateRawRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
}

export function hashRefreshToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
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
        await db.delete(refreshTokensTable).where(eq(refreshTokensTable.id, token.id));
        return null;
    }

    return token;
}

export async function deleteRefreshToken(rawToken: string) {
    const tokenHash = hashRefreshToken(rawToken);

    await db.delete(refreshTokensTable).where(eq(refreshTokensTable.tokenHash, tokenHash));
}
