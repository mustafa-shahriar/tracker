import { Router } from "express";
import { scrape, announce } from "./tracker.controller.ts";
import { verifyPassKey } from "./tracker.middleware.ts";

export const trackerRouter = Router();

trackerRouter.get("/:passkey/announce", verifyPassKey, announce);
trackerRouter.get("/:passkey/scrape", scrape);
