import type { Request, Response, NextFunction } from "express";
import type { ZodObject } from "zod";


export function validate(schema: ZodObject) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: result.error.message,
            });
        }

        req.body = result.data;

        next();
    }
};
