import express, { json } from "express";
import { authRouter } from "./modules/auth/auth.routes.ts";

export const app = express();

app.use("/auth", authRouter)
