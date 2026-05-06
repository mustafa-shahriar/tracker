import { db, s3 } from "../../db/db.ts";
import { config } from "../../config.ts";
import { torrentsTable } from "../../db/schema.ts";
import parseTorrent from 'parse-torrent'
import { torrentMustHaveSchema, updateTorrentReqBodySchema, uploadReqBodySchema } from "./torrents.validation.ts";
import type z from "zod";
import { and, eq, type InferInsertModel } from "drizzle-orm";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";


type CreateTorrentInput = {
    userId: number;
    body: z.infer<typeof uploadReqBodySchema>,
    files: any;
};

export async function createTorrent({
    userId,
    body,
    files,
}: CreateTorrentInput) {
    const torrentFile = files.file?.[0];
    if (!torrentFile) {
        throw new Error("Torrent file is required");
    }
    const coverImg = files.cover?.[0];
    const torrentFileUrl = await uploadFile(torrentFile, torrentFile.mimetype)
    let coverUrl = undefined;
    if (coverImg) {
        coverUrl = await uploadFile(coverImg, coverImg.mimetype)
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
    const [torrent] = await db.select().from(torrentsTable).where(eq(torrentsTable.id, id));
    if (!torrent) {
        throw new Error(`Torrent Not Found with id ${id}`)
    }
    return torrent;
}


export async function deleteTorrent(id: number, userId: number) {
    const [torrent] = await db.delete(torrentsTable).where(and(eq(torrentsTable.id, id), eq(torrentsTable.uploaderId, userId))).returning();
    if (!torrent) {
        throw new Error("You don't have permission do this");
    }
    return torrent;
}

export async function updateTorrent(
    id: number,
    userId: number,
    putObj: z.infer<typeof updateTorrentReqBodySchema>
) {
    let [torrent] = await db.update(torrentsTable)
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
        })
    );

    const baseUrl = config.objectStorage.endpoint!.replace(/\/$/, "");
    return `${baseUrl}/${bucket}/${key}`;
}
