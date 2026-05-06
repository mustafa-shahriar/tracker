import type { Request, Response } from "express";
import { createTorrent, deleteTorrent, getTorrent, updateTorrent } from "./torrents.service.ts"
import { uploadReqBodySchema } from "./torrents.validation.ts";
import type z from "zod";

export async function Post(req: Request<{}, {}, z.infer<typeof uploadReqBodySchema>>, res: Response) {
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
            throw new Error("param should a number")
        }
        let torrent = await getTorrent(id);
        return res.json(torrent);
    } catch (err: any) {
        return res.status(404).json({
            message: err.message,
        });
    }
}

export async function Delete(req: Request, res: Response) {
    try {
        let id = Number(req.params.id);
        if (!id) {
            throw new Error("param should a number")
        }
        let torrent = await deleteTorrent(id, req.user.userId);
        return res.json({ "message": "successfully delete torrent", name: torrent.title });
    } catch (err: any) {
        return res.status(403).json({
            message: err.message,
        });
    }
}

export async function Put(req: Request<any, any, z.infer<typeof uploadReqBodySchema>>, res: Response) {
    try {
        let id = Number(req.params.id);
        if (!id) {
            throw new Error("param should a number")
        }
        let torrent = await updateTorrent(id, req.user.userId, req.user.userId);
        return res.json({ "message": "successfully updated torrent", torrent: torrent });
    } catch (err: any) {
        return res.status(403).json({
            message: err.message,
        });
    }
}
