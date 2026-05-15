import type { Request, Response } from "express";
import type { LoginInput, RegisterInput } from "./auth.validation.ts";
import {
    createRefreshToken,
    createUser,
    generateJwt,
    verifyRefreshToken,
    getUser,
    deleteRefreshToken,
    createUserStat,
} from "./auth.service.ts";

export async function login(req: Request<{}, {}, LoginInput>, res: Response) {
    try {
        const user = await getUser(req.body);
        const jwt = generateJwt({ userId: user.id });
        const refreshToken = await createRefreshToken(user.id);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });

        return res.status(201).json({
            user,
            accessToken: jwt,
        });
    } catch (err: any) {
        console.log(err);
        if (err.message === "Invalid credential") {
            return res.status(401).json({
                message: "Invalid credential",
            });
        }

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

export async function logout(req: Request, res: Response) {
    try {
        const rawToken = req.cookies.refreshToken;
        if (!rawToken) {
            return res.status(401).json({ message: "No refresh Token" });
        }
        await deleteRefreshToken(rawToken as string);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });

        return res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

export async function refresh(req: Request, res: Response) {
    try {
        const rawToken = req.cookies.refreshToken;
        if (!rawToken) {
            return res.status(401).json({ message: "No refresh Token" });
        }

        const token = await verifyRefreshToken(rawToken);
        if (!token) {
            return res.status(401).json({ message: "Invalid refresh Token" });
        }

        const accessToken = generateJwt({ userId: token.userId });

        return res.json({ accessToken });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

export async function register(req: Request<{}, {}, RegisterInput>, res: Response) {
    try {
        const user = await createUser(req.body);
        const jwt = generateJwt({ userId: user.id });
        const refreshToken = await createRefreshToken(user.id);
        await createUserStat(user.id);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });

        return res.status(201).json({
            message: "User created successfully. Please verify your email.",
            user,
            accessToken: jwt,
        });
    } catch (err: any) {
        if (err.code === "23505") {
            return res.status(409).json({
                message: "Email already exists",
            });
        }

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

export async function forgotPassword(req: Request, res: Response) {
    return res.json({ message: "haven't been implemented yet" });
}

export async function resetPassword(req: Request, res: Response) {
    return res.json({ message: "haven't been implemented yet" });
}

export async function verifyEmail(req: Request, res: Response) {
    return res.json({ message: "haven't been implemented yet" });
}

export async function resendVerificationEmail(req: Request, res: Response) {
    return res.json({ message: "haven't been implemented yet" });
}
