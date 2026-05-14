import type { Request, Response, NextFunction } from "express";
import { getUserByPassKey } from "./tracker.service.ts";
import bencodec from "bencodec";

export async function verifyPassKey(req: Request, res: Response, next: NextFunction) {
    try {
        const passKey = req.params.passkey!;
        const user = await getUserByPassKey(passKey as string);
        req.user = user;
        next();
    } catch (err: any) {
        console.log(err);
        return res
            .status(401)
            .set("Content-Type", "text/plain")
            .send(bencodec.encodeToBytes({ "failure reason": "unauthorized access" }));
    }
}
