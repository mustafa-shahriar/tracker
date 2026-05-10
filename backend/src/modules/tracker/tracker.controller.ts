import type { Request, Response } from "express";
import bencodec from "bencodec";
import { redis } from "../../db/db.ts";
import { getPeers, updatePeerSession } from "./tracker.service.ts";
import { ANNOUNCE_INTERVAL, MAX_PEERS } from "../../config.ts";

export async function announce(req: Request, res: Response) {
    try {
        let {
            info_hash,
            peer_id,
            port,
            uploaded,
            downloaded,
            left,
            event,
            numwant = MAX_PEERS,
            compact = 1,
        }: any = req.query;
        port = Number(port);
        downloaded = Number(downloaded);
        uploaded = Number(uploaded);
        left = Number(left);

        if (!port || !downloaded || !uploaded || !left || !info_hash || !peer_id || !port) {
            return res.send(
                bencodec.encodeToString({
                    "failure reason": "missing required parameters",
                }),
            );
        }

        const info_hex = Buffer.from(info_hash, "binary").toString("hex");
        const peerStatus = left === 0 ? "s" : "l";
        const key = `${peerStatus}${req.ip}:${port}`;
        res.setHeader("Content-Type", "text/plain");

        if (event === "stopped") {
            await redis.zRem(info_hex, key);
            return res.send(bencodec.encodeToString({ interval: ANNOUNCE_INTERVAL, peers: "" }));
        }

        let peers = await getPeers({
            ANNOUNCE_INTERVAL,
            info_hex,
            key,
            numwant,
            compact,
        });
        await updatePeerSession({
            user_id: req.user?.id,
            infohash: info_hex,
            uploaded,
            downloaded,
            left,
        });
        res.send(
            bencodec.encodeToBytes({
                interval: ANNOUNCE_INTERVAL,
                "min interval": 900,
                complete: peers.seedersCount,
                incomplete: peers.leechersCount,
                peers: peers.peersList,
            }),
        );
    } catch (err: any) {
        console.log(err);
        return res.send(
            bencodec.encodeToString({
                "failure reason": "Internal server error",
            }),
        );
    }
}
