import { Router } from "express";
import { uploadedFilesValidator } from "./torrents.middleware.ts";
import { validatePayload } from "../../middleware.ts";
import { updateTorrentReqBodySchema, uploadReqBodySchema } from "./torrents.validation.ts";
import {
    Post,
    Get,
    Put,
    Delete,
    recentTorrents,
    search,
    myTorrents,
    downloadTorrentFile,
    getTrackerUrl,
} from "./torrents.controller.ts";
import { verifyLogin } from "../auth/auth.middleware.ts";

export const torrentRouter = Router();
torrentRouter.use(verifyLogin);

torrentRouter.post("/", uploadedFilesValidator, validatePayload(uploadReqBodySchema), Post);
torrentRouter.get("/recent", recentTorrents);
torrentRouter.get("/my_torrents", myTorrents);
torrentRouter.get("/search/:q", search);
torrentRouter.get("/tracker_url", getTrackerUrl);
torrentRouter.get("/:id/download", downloadTorrentFile);
torrentRouter.get("/:id", Get);
torrentRouter.put("/:id", validatePayload(updateTorrentReqBodySchema), Put);
torrentRouter.delete("/:id", Delete);
