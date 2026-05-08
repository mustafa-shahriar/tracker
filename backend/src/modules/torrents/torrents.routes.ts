import { Router } from "express";
import { uploadedFilesValidator } from "./torrents.middleware.ts";
import { validatePayload } from "../../middleware.ts";
import { updateTorrentReqBodySchema, uploadReqBodySchema } from "./torrents.validation.ts";
import { Post, Get, Put, Delete } from "./torrents.controller.ts";
import { verifyLogin } from "../auth/auth.middleware.ts";

export const torrentRouter = Router();
torrentRouter.use(verifyLogin);

torrentRouter.post("/", uploadedFilesValidator, validatePayload(uploadReqBodySchema), Post);
torrentRouter.get("/:id", Get);
torrentRouter.put("/:id", validatePayload(updateTorrentReqBodySchema), Put);
torrentRouter.delete("/:id", Delete);
