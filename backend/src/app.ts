import express, { json } from "express";
import { authRouter } from "./modules/auth/auth.routes.ts";
import cookieParser from "cookie-parser";
import cors from "cors";
import { FRONTEND_URL } from "./config.ts";

export const app = express();

app.use(json());
app.use(cookieParser());
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
}))

app.use("/auth", authRouter);
