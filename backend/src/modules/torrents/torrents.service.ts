import { db, s3 } from "../../db/db.ts";
import { BACKEND_URL, config } from "../../config.ts";
import { torrentsTable, userStatTable } from "../../db/schema.ts";
import parseTorrent from "parse-torrent";
import {
    torrentMustHaveSchema,
    updateTorrentReqBodySchema,
    uploadReqBodySchema,
} from "./torrents.validation.ts";
import type z from "zod";
import { and, eq, ilike, type InferInsertModel } from "drizzle-orm";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import bencodec from "bencodec";
import { string } from "zod";

type CreateTorrentInput = {
    userId: number;
    body: z.infer<typeof uploadReqBodySchema>;
    files: any;
};

export async function createTorrent({ userId, body, files }: CreateTorrentInput) {
    const torrentFile = files.file?.[0];
    if (!torrentFile) {
        throw new Error("Torrent file is required");
    }
    const coverImg = files.cover?.[0];
    const torrentFileUrl = await uploadFile(torrentFile, torrentFile.mimetype);
    let coverUrl = undefined;
    if (coverImg) {
        coverUrl = await uploadFile(coverImg, coverImg.mimetype);
    }

    const torrent = parseTorrent(torrentFile);
    const parsedTorrent = torrentMustHaveSchema.parse(torrent);
    const values: InferInsertModel<typeof torrentsTable> = {
        title: body.title || parsedTorrent.info.name,
        description: body.description,
        size: parsedTorrent.info.length,
        infoHash: parsedTorrent.info.infoHash,
        fileUrl: torrentFileUrl,
        coverImgUrl: coverImg,
        uploaderId: userId,
        category: body.category,
        languages: body.languages,
        subtitles: body.subtitles,
    };
    const [uploadedTorrent] = await db.insert(torrentsTable).values(values).returning();
    return uploadedTorrent;
}

export async function getTorrent(id: number) {
    const [torrent] = await db
        .select({
            id: torrentsTable.id,
            title: torrentsTable.title,
            description: torrentsTable.description,
            size: torrentsTable.size,
            infoHash: torrentsTable.infoHash,
            coverImgUrl: torrentsTable.coverImgUrl,
            category: torrentsTable.category,
            languages: torrentsTable.languages,
            subtitles: torrentsTable.subtitles,
            completedCount: torrentsTable.completedCount,
            createdAt: torrentsTable.createdAt,
        })
        .from(torrentsTable)
        .where(eq(torrentsTable.id, id));
    if (!torrent) {
        throw new Error(`Torrent Not Found with id ${id}`);
    }
    return torrent;
}

export async function getRecentTorrents() {
    const torrents = await db
        .select({
            id: torrentsTable.id,
            title: torrentsTable.title,
            infoHash: torrentsTable.infoHash,
            size: torrentsTable.size,
            category: torrentsTable.category,
            languages: torrentsTable.languages,
            completedCount: torrentsTable.completedCount,
            createdAt: torrentsTable.createdAt,
        })
        .from(torrentsTable)
        .orderBy(torrentsTable.createdAt)
        .limit(10);
    return torrents;
}

export async function searchTorrent(q: string) {
    const torrents = await db
        .select({
            id: torrentsTable.id,
            title: torrentsTable.title,
            infoHash: torrentsTable.infoHash,
            size: torrentsTable.size,
            category: torrentsTable.category,
            languages: torrentsTable.languages,
            completedCount: torrentsTable.completedCount,
            createdAt: torrentsTable.createdAt,
        })
        .from(torrentsTable)
        .where(ilike(torrentsTable.title, `%${q}%`))
        .limit(10);
    return torrents;
}

export async function getMyTorrents(userId: number) {
    const torrents = await db
        .select({
            id: torrentsTable.id,
            title: torrentsTable.title,
            infoHash: torrentsTable.infoHash,
            size: torrentsTable.size,
            category: torrentsTable.category,
            languages: torrentsTable.languages,
            completedCount: torrentsTable.completedCount,
            createdAt: torrentsTable.createdAt,
        })
        .from(torrentsTable)
        .where(eq(torrentsTable.uploaderId, userId))
        .limit(10);
    return torrents;
}

export async function deleteTorrent(id: number, userId: number) {
    const [torrent] = await db
        .delete(torrentsTable)
        .where(and(eq(torrentsTable.id, id), eq(torrentsTable.uploaderId, userId)))
        .returning();
    if (!torrent) {
        throw new Error("You don't have permission do this");
    }
    return torrent;
}

export async function updateTorrent(
    id: number,
    userId: number,
    putObj: z.infer<typeof updateTorrentReqBodySchema>,
) {
    let [torrent] = await db
        .update(torrentsTable)
        .set(putObj)
        .where(and(eq(torrentsTable.id, id), eq(torrentsTable.uploaderId, userId)))
        .returning();
    if (!torrent) {
        throw new Error("You don't have permission do this");
    }
    return torrent;
}

async function uploadFile(buffer: Buffer, contentType: string): Promise<string> {
    const bucket = config.objectStorage.bucket!;

    const key = `uploads/${randomUUID()}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        }),
    );

    const baseUrl = config.objectStorage.endpoint!.replace(/\/$/, "");
    return `${baseUrl}/${bucket}/${key}`;
}

export async function getFile(url: string) {
    const bucket = config.objectStorage.bucket!;
    const key = url.split("/").pop();

    const res = await s3.send(
        new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        }),
    );

    if (!res.Body) {
        throw new Error("Empty file body");
    }

    const chunks: Buffer[] = [];

    for await (const chunk of res.Body as any) {
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
}

export async function getUserPasskey(userId: number) {
    const [state] = await db
        .select({ passkey: userStatTable.passKey })
        .from(userStatTable)
        .where(eq(userStatTable.user_id, userId));
    if (!state) {
        throw new Error("Invalid userId");
    }

    return state.passkey;
}

async function modifyTorrentFile(fileBuf: Buffer, passkey: string) {
    const file: any = bencodec.decode(fileBuf);
    file.announce = `${BACKEND_URL}/tracker/${passkey}/annouch`;
    return bencodec.encodeToBytes(file);
}

export async function getModifiedTorrentFile(torrentId: number, userId: number) {
    const passkey = await getUserPasskey(userId);
    const [torrent] = await db
        .select({ url: torrentsTable.fileUrl, title: torrentsTable.title })
        .from(torrentsTable)
        .where(eq(torrentsTable.id, torrentId));
    if (!torrent) {
        throw new Error("Invalid torrent id");
    }

    const file = await getFile(torrent.url);
    return { file: await modifyTorrentFile(file, passkey), title: torrent.title };
}
