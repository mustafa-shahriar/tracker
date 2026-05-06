import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config.ts";
import type { AuthUser } from "../../types/auth.ts";

export function verifyLogin(req: Request, res: Response, next: NextFunction) {
    try {
        const authorization = req.headers.Authorization!;
        const token = authorization.toString().split(" ")[1] as string;
        const user = jwt.verify(token, JWT_SECRET) as AuthUser;
        req.user = user;
        next();
    } catch (err: any) {
        console.log(err);
        return res.json({ "message": err.message })
    }
}
