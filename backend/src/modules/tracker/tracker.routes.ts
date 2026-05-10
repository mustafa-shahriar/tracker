import { Router } from "express";
import { announce } from "./tracker.controller.ts";
import { verifyPassKey } from "./tracker.middleware.ts";

export const trackerRouter = Router();

trackerRouter.get("/:passkey/announce", verifyPassKey, announce);
