import type { Request, Response } from "express";
import {
    createTorrent,
    deleteTorrent,
    getModifiedTorrentFile,
    getMyTorrents,
    getRecentTorrents,
    getTorrent,
    searchTorrent,
    updateTorrent,
} from "./torrents.service.ts";
import { uploadReqBodySchema } from "./torrents.validation.ts";
import type z from "zod";
import { getSeedLeechCount, getSeedLeechCountsBatch } from "../tracker/tracker.service.ts";
import { ANNOUNCE_INTERVAL } from "../../config.ts";

export async function Post(
    req: Request<{}, {}, z.infer<typeof uploadReqBodySchema>>,
    res: Response,
) {
    try {
        const userId = req.user.userId;

        const result = await createTorrent({
            userId,
            body: req.body,
            files: req.files,
        });

        return res.status(201).json({
            message: "Torrent uploaded successfully",
            data: result,
            torrentId: result?.id,
        });
    } catch (err: any) {
        return res.status(400).json({
            message: err.message,
        });
    }
}

export async function Get(req: Request, res: Response) {
    try {
        let id = Number(req.params.id);
        if (!id) {
            throw new Error("param should a number");
        }
        let torrent = await getTorrent(id);
        let peerStat = await getSeedLeechCount(ANNOUNCE_INTERVAL, torrent.infoHash);
        return res.json({ ...torrent, ...peerStat });
    } catch (err: any) {
        return res.status(404).json({
            message: err.message,
        });
    }
}

export async function recentTorrents(_req: Request, res: Response) {
    try {
        let torrents = await getRecentTorrents();
        let peerStat = await getSeedLeechCountsBatch(
            ANNOUNCE_INTERVAL,
            torrents.map((t) => t.infoHash),
        );
        return res.json({ torrents, stat: peerStat });
    } catch (err: any) {
        return res.status(404).json({
            message: err.message,
        });
    }
}

export async function search(req: Request, res: Response) {
    try {
        const q = req.params.q;
        let torrents = await searchTorrent(q as string);
        let peerStat = await getSeedLeechCountsBatch(
            ANNOUNCE_INTERVAL,
            torrents.map((t) => t.infoHash),
        );
        return res.json({ torrents, stat: peerStat });
    } catch (err: any) {
        return res.status(403).json({
            message: err.message,
        });
    }
}

export async function myTorrents(req: Request, res: Response) {
    try {
        let torrents = await getMyTorrents(req.user.userId);
        let peerStat = await getSeedLeechCountsBatch(
            ANNOUNCE_INTERVAL,
            torrents.map((t) => t.infoHash),
        );
        return res.json({ torrents, stat: peerStat });
    } catch (err: any) {
        return res.status(403).json({
            message: err.message,
        });
    }
}

export async function downloadTorrentFile(req: Request, res: Response) {
    try {
        let id = Number(req.params.id);
        if (!id) {
            throw new Error("param should a number");
        }

        let file = await getModifiedTorrentFile(id, req.user.userId);
        res.status(200)
            .type("application/x-bittorrent")
            .setHeader("Content-Disposition", `attachment; filename=${file.title}`)
            .send(file.file);
    } catch (err: any) {
        return res.status(403).json({
            message: err.message,
        });
    }
}

export async function Delete(req: Request, res: Response) {
    try {
        let id = Number(req.params.id);
        if (!id) {
            throw new Error("param should a number");
        }
        let torrent = await deleteTorrent(id, req.user.userId);
        return res.json({ message: "successfully delete torrent", name: torrent.title });
    } catch (err: any) {
        return res.status(403).json({
            message: err.message,
        });
    }
}

export async function Put(
    req: Request<any, any, z.infer<typeof uploadReqBodySchema>>,
    res: Response,
) {
    try {
        let id = Number(req.params.id);
        if (!id) {
            throw new Error("param should a number");
        }
        let torrent = await updateTorrent(id, req.user.userId, req.user.userId);
        return res.json({ message: "successfully updated torrent", torrent: torrent });
    } catch (err: any) {
        return res.status(403).json({
            message: err.message,
        });
    }
}
