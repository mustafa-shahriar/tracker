import type { Request, Response } from "express";
import bencodec from "bencodec";
import { redis } from "../../db/db.ts";

const ANNOUNCE_INTERVAL = 60 * 30;
const PEER_TTL = ANNOUNCE_INTERVAL * 2;
const MAX_PEERS = 50;

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
            numwant = 50,
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

        if (event === "stopped") {
            await redis.zRem(info_hex, key);
            return res.send(bencodec.encodeToString({ interval: ANNOUNCE_INTERVAL, peers: "" }));
        }

        await redis.zRemRangeByScore(info_hex, 0, Date.now() - PEER_TTL);
        const peers = await redis.zRangeByScore(info_hex, Date.now() - PEER_TTL, "+inf", {
            LIMIT: {
                offset: MAX_PEERS,
                count: numwant,
            },
        });

        await redis.zAdd(info_hex, { score: Date.now(), value: key });

        let payload = undefined;
        let seedersCount = 0;
        let leechersCount = 0;
        if (compact === 1) {
            const buf = Buffer.alloc(peers.length * 6);
            peers.forEach((peer, i) => {
                if (peer.startsWith("s")) {
                    seedersCount++;
                } else {
                    leechersCount++;
                }
                const [ip, port] = peer.substring(1).split(":");
                const offset = i * 6;
                const parts = ip?.split(".").map(Number);
                parts?.forEach((part, j) => buf.writeUInt8(part, offset + j));
                buf.writeUInt16BE(Number(port), offset + 4);
            });
            payload = buf;
        }

        res.send(
            bencodec.encodeToString({
                interval: ANNOUNCE_INTERVAL,
                "min interval": 900,
                complete: seedersCount,
                incomplete: leechersCount,
                peers: payload,
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

export async function scrape(req: Request, res: Response) {}
