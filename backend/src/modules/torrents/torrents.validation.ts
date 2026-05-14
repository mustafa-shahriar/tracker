import bencodec from "bencodec";
import crypto from "node:crypto";
import { z } from "zod";

const category = z.enum([
    "movie",
    "series",
    "anime",
    "documentary",

    "game",
    "software",
    "music",

    "book",
    "ebook",
    "audiobook",

    "course",
    "tutorial",

    "other",
]);

export const uploadReqBodySchema = z.object({
    title: z.string().max(255).optional(),
    description: z.string().max(5000).optional(),
    category: category,
    languages: z.array(z.string()).optional(),
    subtitles: z.array(z.string()).optional(),
});

export const updateTorrentReqBodySchema = z.strictObject({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),

    category: category,
    languages: z.array(z.string()).optional(),
    subtitles: z.array(z.string()).optional(),
    isPrivate: z.boolean().optional(),
});

function isBytes(v: unknown): v is Uint8Array {
    return v instanceof Uint8Array;
}

function isInteger(v: unknown): v is number {
    return Number.isInteger(v);
}

export function getInfoHashHex(torrent: any): string {
    if (!torrent.info) {
        throw new Error("Missing info dictionary");
    }

    const encodedInfo = bencodec.encodeToBytes(torrent.info);
    const hash = crypto.createHash("sha1").update(encodedInfo).digest("hex");

    return hash;
}

export function validateTorrent(torrent: any): void {
    if (typeof torrent !== "object" || torrent === null) {
        throw new Error("Torrent must be a dictionary");
    }

    if ("announce" in torrent && !isBytes(torrent.announce)) {
        throw new Error("announce must be bytes");
    }

    if (!torrent.info || typeof torrent.info !== "object") {
        throw new Error("Missing info dictionary");
    }

    const info = torrent.info;

    if (!isBytes(info.name)) {
        throw new Error("info.name must be bytes");
    }

    if (!isInteger(info["piece length"])) {
        throw new Error("info['piece length'] must be integer");
    }

    if (info["piece length"] <= 0) {
        throw new Error("piece length must be > 0");
    }

    if (!isBytes(info.pieces)) {
        throw new Error("info.pieces must be bytes");
    }

    if (info.pieces.length % 20 !== 0) {
        throw new Error("pieces length must be multiple of 20");
    }

    const isSingleFile = "length" in info;
    const isMultiFile = Array.isArray(info.files);

    if (isSingleFile && isMultiFile) {
        throw new Error("Torrent cannot be both single and multi file");
    }

    if (!isSingleFile && !isMultiFile) {
        throw new Error("Torrent must be single or multi file");
    }

    if (isSingleFile) {
        if (!isInteger(info.length)) {
            throw new Error("info.length must be integer");
        }

        if (info.length < 0) {
            throw new Error("info.length must be >= 0");
        }
    }

    if (isMultiFile) {
        for (const file of info.files) {
            if (typeof file !== "object" || file === null) {
                throw new Error("file entry must be dictionary");
            }

            if (!isInteger(file.length)) {
                throw new Error("file.length must be integer");
            }

            if (!Array.isArray(file.path)) {
                throw new Error("file.path must be list");
            }

            if (file.path.length === 0) {
                throw new Error("file.path cannot be empty");
            }

            for (const part of file.path) {
                if (!isBytes(part)) {
                    throw new Error("file.path items must be bytes");
                }
            }
        }
    }
}

export function getTotalLength(torrent: any): number {
    if (!torrent?.info) {
        throw new Error("Missing info dictionary");
    }

    const info = torrent.info;

    if (typeof info.length === "number") {
        return info.length;
    }

    if (Array.isArray(info.files)) {
        let total = 0;

        for (const file of info.files) {
            if (typeof file.length !== "number") {
                throw new Error("Invalid file length");
            }
            total += file.length;
        }

        return total;
    }

    throw new Error("Invalid torrent structure: no length or files");
}

export function setAnnounceUrl(torrent: any, announceUrl: string): void {
    torrent.announce = new TextEncoder().encode(announceUrl);
}
